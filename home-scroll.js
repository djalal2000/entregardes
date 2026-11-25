
(() => {
  'use strict';
  const FRAME_COUNT = 180;
  const SEQUENCE_NAME = 'PEMESA cinematic film 180';
  // Exact motion extracted from the user-supplied reference video.
  // No frame blending: the video sequence is controlled directly by scroll position.
  const FRAME_BASE = matchMedia('(max-width:700px)').matches ? './frames-film-mobile' : './frames-film';
  const FRAME_ASSET_VERSION = '20261124-film3';
  const LOADERS = 3;
  const CACHE_LIMIT = FRAME_BASE.includes('mobile') ? 28 : 36;
  const ANCHORS = Array.from({ length: 9 }, (_, i) => i * 22).concat(FRAME_COUNT - 1);
  const anchorSet = new Set(ANCHORS);
  const SCROLL_HEIGHTS = 4.5;
  const root = document.querySelector('#pemesa-scroll-experience');
  const stage = document.querySelector('#pemesa-scroll-stage');
  const canvas = document.querySelector('#pemesa-sequence-canvas');
  const site = document.querySelector('#site');
  if (!root || !stage || !canvas || !site) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const chapters = [...root.querySelectorAll('[data-pm-chapter]')];
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
  let nativeScheduled = false, ready = false;
  let started = false, backgroundReady = false, redrawScheduled = false;
  let currentImage = null;
  const inFlight = new Set();
  const failedFrames = new Set();
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
    const image = closestFrame(target);
    if (!image || (target === currentIndex && image === currentImage)) return;
    const fit = matchMedia('(min-width:901px)').matches ? Math.min : Math.max;
    const scale = fit(width / image.naturalWidth, height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const x = (width - drawnWidth) * .5;
    const y = (height - drawnHeight) * .5;
    ctx.fillStyle = '#dcd0c8';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, x, y, drawnWidth, drawnHeight);
    currentIndex = target;
    currentImage = image;
  }
  function updateProgress(progress) {
    currentProgress = clamp(progress, 0, 1);
    showChapter(currentProgress);
    if (ready) drawFrame(Math.round(currentProgress * (FRAME_COUNT - 1)));
    pumpFrames();
  }
  function resize() {
    if (!ctx || site.hidden) return;
    const rect = canvas.getBoundingClientRect();
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
      image.fetchPriority = index === 0 ? 'high' : 'low';
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) reject(new Error('Image WebP illisible'));
        else resolve(image);
      };
      image.onerror = () => reject(new Error('Fichier absent : ' + filename(index)));
      image.src = filename(index);
    });
  }
  // Do not block the home page: load the first frame, then only the
  // useful frames around the scroll position plus sparse seek anchors.
  function targetIndex() {
    return reduce.matches ? 0 : Math.round(currentProgress * (FRAME_COUNT - 1));
  }
  function trimCache(target) {
    const loaded = frames.reduce((n, image) => n + Boolean(image), 0);
    if (loaded <= CACHE_LIMIT) return;
    const evictable = frames.map((image, index) => ({ image, index }))
      .filter(item => item.image && !anchorSet.has(item.index) &&
        item.image !== currentImage && item.index !== target)
      .sort((a, b) => Math.abs(b.index - target) - Math.abs(a.index - target));
    for (const item of evictable.slice(0, loaded - CACHE_LIMIT)) frames[item.index] = null;
  }
  function requestRedraw() {
    if (redrawScheduled) return;
    redrawScheduled = true;
    requestAnimationFrame(() => {
      redrawScheduled = false;
      if (site.hidden || !ready) return;
      drawFrame(targetIndex());
    });
  }
  function queueOrder(target) {
    if (reduce.matches) return [0];
    if (!ready) return [target, 0, ...ANCHORS];
    const nearby = [target];
    for (let distance = 1; distance <= 10; distance++) {
      nearby.push(target + distance, target - distance);
    }
    const anchors = [...ANCHORS].sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    return [...nearby.slice(0, 7), ...anchors, ...nearby.slice(7)];
  }
  function pumpFrames() {
    if (!started || site.hidden || !ctx) return;
    const target = targetIndex();
    const limit = ready && backgroundReady && !reduce.matches ? LOADERS : 1;
    // Until the page has loaded, fetch only the first useful image.
    if (ready && !backgroundReady && target === 0) return;
    const order = queueOrder(target);
    while (inFlight.size < limit) {
      const index = order.find(i => i >= 0 && i < FRAME_COUNT &&
        !frames[i] && !inFlight.has(i) && !failedFrames.has(i));
      if (index === undefined) break;
      inFlight.add(index);
      loadFrame(index).then(image => {
        frames[index] = image;
        if (!ready) {
          ready = true;
          root.classList.remove('pm-no-frames');
          root.classList.add('pm-frames-ready');
          resize();
        }
        trimCache(targetIndex());
        requestRedraw();
      }).catch(err => {
        failedFrames.add(index);
        console.warn('[PEMESA frames]', err.message);
      }).finally(() => {
        inFlight.delete(index);
        pumpFrames();
      });
    }
  }
  function prepareFrames() {
    if (started) return;
    started = true;
    pumpFrames();
    const enableBackground = () => {
      backgroundReady = true;
      pumpFrames();
    };
    if (document.readyState === 'complete') enableBackground();
    else {
      window.addEventListener('load', enableBackground, { once: true });
      // Avoid waiting indefinitely for unrelated third-party resources.
      window.setTimeout(enableBackground, 1200);
    }
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
    pumpFrames();
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
        id: 'pemesa-home-180',
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
      resizeObserver.observe(canvas);
    }
    visibilityObserver = new MutationObserver(switchVisible);
    visibilityObserver.observe(site, { attributes: true, attributeFilter: ['hidden'] });
    updateProgress(0);
  }
  reduce.addEventListener?.('change', () => {
    currentIndex = -1;
    requestRedraw();
    pumpFrames();
  });
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
