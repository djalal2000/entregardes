
(() => {
  'use strict';
  const SCROLL_HEIGHTS = 4.5;
  const root = document.querySelector('#pemesa-scroll-experience');
  const stage = document.querySelector('#pemesa-scroll-stage');
  const video = document.querySelector('#pemesa-scroll-video');
  const site = document.querySelector('#site');
  if (!root || !stage || !video || !site) return;
  const chapters = [...root.querySelectorAll('[data-pm-chapter]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = x => {
    const t = clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const windows = [
    { begin: 0, end: 0.40, enter: 0, leave: 0.08 },
    { begin: 0.45, end: 0.76, enter: 0.065, leave: 0.08 },
    { begin: 0.80, end: 1, enter: 0.07, leave: 0 }
  ];
  let currentProgress = 0;
  let scrollTrigger = null, lenis = null, tickerCallback = null;
  let nativeScheduled = false;

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
  function syncVideo() {
    if (site.hidden || reduce.matches || !Number.isFinite(video.duration) || video.seeking) return;
    const frame = 1 / 23;
    const target = Math.min(Math.round(currentProgress * video.duration / frame) * frame, video.duration - frame);
    if (Math.abs(video.currentTime - target) > frame / 2) video.currentTime = target;
  }
  function prepareVideo() {
    if (reduce.matches) {
      if (video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
    } else if (!site.hidden && currentProgress > 0 && !video.hasAttribute('src')) {
      video.preload = 'auto';
      video.src = video.dataset.src;
      video.load();
    }
    syncVideo();
  }
  video.addEventListener('loadeddata', syncVideo);
  video.addEventListener('seeked', syncVideo);

  function updateProgress(progress) {
    currentProgress = clamp(progress, 0, 1);
    showChapter(currentProgress);
    prepareVideo();
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
    prepareVideo();
    if (scrollTrigger) {
      scrollTrigger.enable(false, true);
      requestAnimationFrame(() => { ScrollTrigger.refresh(); });
    } else {
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
      if (scrollTrigger && !site.hidden) ScrollTrigger.refresh();
      else nativeUpdate();
    }, { passive: true });
    const visibilityObserver = new MutationObserver(switchVisible);
    visibilityObserver.observe(site, { attributes: true, attributeFilter: ['hidden'] });
    root.classList.add('pm-frames-ready');
  }
  reduce.addEventListener?.('change', prepareVideo);
  window.PEMESA_HOME_SCROLL = {
    refresh: () => { if (scrollTrigger) ScrollTrigger.refresh(); else nativeUpdate(); },
    get hasFrames() { return video.readyState >= 2; },
    get progress() { return currentProgress; }
  };
  if (site.hidden) {
    const waitForHome = new MutationObserver(() => {
      if (site.hidden) return;
      waitForHome.disconnect();
      setupScroll();
    });
    waitForHome.observe(site, { attributes: true, attributeFilter: ['hidden'] });
  } else {
    setupScroll();
  }
})();
