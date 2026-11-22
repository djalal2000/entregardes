
(() => {
  'use strict';
  const FRAME_COUNT = 120;
  const SEQUENCE_NAME = 'PEMESA cinematic v2';
  // Cinematic v2 is derived from the five approved visual keyframes.
  // Never silently fall back to the old low-quality captured-video sequence.
  const FRAME_BASE = './frames-v2';
  const FRAME_ASSET_VERSION = '20261123-published';
  const LOADERS = 7;
  const SCROLL_HEIGHTS = 4.5;
  const root = document.querySelector('#pemesa-scroll-experience');
  const stage = document.querySelector('#pemesa-scroll-stage');
  const canvas = document.querySelector('#pemesa-sequence-canvas');
  const site = document.querySelector('#site');
  if (!root || !stage || !canvas || !site) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const chapters = [...root.querySelectorAll('[data-pm-chapter]')];
  const loader = root.querySelector('#pemesa-sequence-loader');
  const loadNumber = root.querySelector('#pemesa-loading-percent');
  const loadBar = root.querySelector('#pemesa-loading-bar');
  const loadCaption = root.querySelector('#pemesa-loading-caption');
  const loadSkip = root.querySelector('#pemesa-loading-skip');
  const progressFill = root.querySelector('#pemesa-progress-fill');
  const progressText = root.querySelector('#pemesa-progress-percent');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const frames = Array(FRAME_COUNT).fill(null);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = x => {
    const t = clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const filename = index => FRAME_BASE + '/frame_' + String(index + 1).padStart(4, '0') + '.webp?v=' + FRAME_ASSET_VERSION;
  const windows = [
    { begin: 0, end: 0.40, enter: 0, leave: 0.08 },
    { begin: 0.45, end: 0.76, enter: 0.065, leave: 0.08 },
    { begin: 0.80, end: 1, enter: 0.07, leave: 0 }
  ];
  let dpr = 1, width = 0, height = 0, currentIndex = -1, currentProgress = 0;
  let scrollTrigger = null, lenis = null, tickerCallback = null;
  let nativeScheduled = false, loading = false, ready = false;
  let resizeObserver = null, visibilityObserver = null;

  function opacity(progress, cfg) {
    if (progress < cfg.begin || progress > cfg.end) return 0;
    const enter = cfg.enter ? smooth((progress - cfg.begin) / cfg.enter) : 1;
    const leave = cfg.leave ? 1 - smooth((progress - (cfg.end - cfg.leave)) / cfg.leave) : 1;
    return clamp(Math.min(enter, leave), 0, 1);
  }
  function showChapter(progress) {
    chapters.forEach((node, i) => {
      const value = opacity(progress, windows[i]);
      node.style.opacity = String(value);
      node.style.visibility = value < .01 ? 'hidden' : 'visible';
      node.style.transform = 'translate3d(0, calc(-46% + ' + ((1 - value) * 20) + 'px), 0)';
      node.style.pointerEvents = value > .97 ? 'auto' : 'none';
      node.setAttribute('aria-hidden', value < .01 ? 'true' : 'false');
      if (value < .01) node.querySelectorAll('button,a').forEach(el => el.tabIndex = -1);
      else node.querySelectorAll('button,a').forEach(el => el.removeAttribute('tabindex'));
    });
  }
  function closestFrame(index) {
    if (frames[index]) return frames[index];
    for (let gap = 1; gap < FRAME_COUNT; gap++) {
      if (index - gap >= 0 && frames[index - gap]) return frames[index - gap];
      if (index + gap < FRAME_COUNT && frames[index + gap]) return frames[index + gap];
    }
    return null;
  }
  function drawFrame(index) {
    if (!ctx || !width || !height) return;
    const target = reduce.matches ? 0 : clamp(index, 0, FRAME_COUNT - 1);
    if (target === currentIndex) return;
    const image = closestFrame(target);
    if (!image) return;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const x = (width - drawnWidth) * .5;
    const y = (height - drawnHeight) * .5;
    ctx.fillStyle = '#dcd0c8';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, x, y, drawnWidth, drawnHeight);
    currentIndex = target;
  }
  function updateProgress(progress) {
    currentProgress = clamp(progress, 0, 1);
    const percent = Math.round(currentProgress * 100);
    progressFill.style.height = percent + '%';
    progressText.textContent = String(percent).padStart(2, '0') + '%';
    showChapter(currentProgress);
    if (ready) drawFrame(Math.round(currentProgress * (FRAME_COUNT - 1)));
  }
  function resize() {
    if (!ctx || site.hidden) return;
    const rect = stage.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const nextDpr = Math.min(devicePixelRatio || 1, 1.8);
    if (width === nextWidth && height === nextHeight && dpr === nextDpr) return;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    currentIndex = -1;
    if (ready) drawFrame(Math.round(currentProgress * (FRAME_COUNT - 1)));
  }
  function loadFrame(index) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      if (index === 0) image.fetchPriority = 'high';
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) reject(new Error('Image WebP illisible'));
        else resolve(image);
      };
      image.onerror = () => reject(new Error('Fichier absent : ' + filename(index)));
      image.src = filename(index);
    });
  }
  function displayLoadProgress(completed, total) {
    const pct = Math.round((completed / total) * 100);
    loadNumber.textContent = pct + '%';
    loadBar.style.width = pct + '%';
    loadCaption.textContent = completed + ' / ' + total + ' images';
  }
  function dismissLoader() {
    loader.classList.add('is-hidden');
    window.setTimeout(() => { loader.hidden = true; }, 500);
  }
  loadSkip?.addEventListener('click', dismissLoader);
  async function prepareFrames() {
    if (loading) return;
    loading = true;
    try {
      // Avoid a broken page when the /frames assets have not been uploaded.
      frames[0] = await loadFrame(0);
    } catch {
      root.classList.add('pm-no-frames');
      console.info('[PEMESA] Nouvelle animation en attente de publication dans /frames-v2.');
      loading = false;
      return;
    }
    ready = true;
    root.classList.add('pm-frames-ready');
    resize();
    drawFrame(Math.round(currentProgress * (FRAME_COUNT - 1)));
    if (reduce.matches) { loading = false; return; }
    loader.hidden = false;
    loader.classList.remove('is-hidden');
    let completed = 1, next = 1, failed = 0;
    displayLoadProgress(completed, FRAME_COUNT);
    async function worker() {
      while (next < FRAME_COUNT) {
        const i = next++;
        try { frames[i] = await loadFrame(i); }
        catch (err) { failed++; console.warn('[PEMESA frames]', err.message); }
        completed++;
        displayLoadProgress(completed, FRAME_COUNT);
      }
    }
    await Promise.all(Array.from({ length: LOADERS }, worker));
    loading = false;
    if (failed) {
      console.warn('[PEMESA frames] ' + failed + ' frames absentes. Des images voisines seront utilisées.');
      loadCaption.textContent = 'Séquence partiellement chargée';
    } else {
      loadCaption.textContent = 'Animation prête';
    }
    currentIndex = -1;
    drawFrame(Math.round(currentProgress * (FRAME_COUNT - 1)));
    window.setTimeout(dismissLoader, 150);
  }
  function nativeUpdate() {
    if (site.hidden) return;
    const rect = root.getBoundingClientRect();
    const distance = Math.max(1, root.offsetHeight - innerHeight);
    updateProgress(clamp(-rect.top / distance, 0, 1));
  }
  function nativeScrollHandler() {
    if (nativeScheduled) return;
    nativeScheduled = true;
    requestAnimationFrame(() => { nativeScheduled = false; nativeUpdate(); });
  }
  function createLenis() {
    if (lenis || !window.Lenis || reduce.matches || site.hidden || !window.gsap || !window.ScrollTrigger) return;
    lenis = new Lenis({ autoRaf: false, duration: 1.12, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    if (!tickerCallback) {
      tickerCallback = time => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }
  }
  function switchVisible() {
    if (site.hidden) {
      if (lenis) { lenis.destroy(); lenis = null; }
      if (scrollTrigger) scrollTrigger.disable(false, false);
      return;
    }
    createLenis();
    if (scrollTrigger) {
      scrollTrigger.enable(false, true);
      requestAnimationFrame(() => { resize(); ScrollTrigger.refresh(); });
    } else {
      resize();
      nativeUpdate();
    }
  }
  function setupScroll() {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      scrollTrigger = ScrollTrigger.create({
        id: 'pemesa-home-120',
        trigger: root,
        start: 'top top',
        end: () => '+=' + Math.round(innerHeight * SCROLL_HEIGHTS),
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => updateProgress(self.progress),
        onRefresh: self => updateProgress(self.progress)
      });
      createLenis();
      ScrollTrigger.refresh();
    } else {
      root.classList.add('pm-native-scroll');
      window.addEventListener('scroll', nativeScrollHandler, { passive: true });
      nativeUpdate();
    }
    window.addEventListener('resize', () => {
      resize();
      if (scrollTrigger && !site.hidden) ScrollTrigger.refresh();
      else nativeUpdate();
    }, { passive: true });
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
    }
    visibilityObserver = new MutationObserver(switchVisible);
    visibilityObserver.observe(site, { attributes: true, attributeFilter: ['hidden'] });
    updateProgress(0);
  }
  window.PEMESA_HOME_SCROLL = {
    refresh: () => { if (scrollTrigger) ScrollTrigger.refresh(); resize(); },
    get hasFrames() { return ready; },
    get progress() { return currentProgress; }
  };
  if (site.hidden) {
    const waitForHome = new MutationObserver(() => {
      if (site.hidden) return;
      waitForHome.disconnect();
      setupScroll();
      resize();
      prepareFrames();
    });
    waitForHome.observe(site, { attributes: true, attributeFilter: ['hidden'] });
  } else {
    setupScroll();
    resize();
    prepareFrames();
  }
})();
