/* PEMESA — progressive, scroll-triggered motion.
 * Content stays visible when JavaScript is unavailable or reduced motion is on.
 * Reveals run at most once per element; dynamic dashboard panels are refreshed after render.
 */
(function(){
  'use strict';

  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const selector=[
    '.features-section .section-heading',
    '.features-section .feature-card',
    '.how-section .how-copy',
    '.how-section .step',
    '.privacy-section',
    '.profile-hero',
    '.profile-section',
    '.app-heading',
    '#view .metric-card',
    '#view .panel'
  ].join(',');

  const supported='IntersectionObserver' in window;
  const enabled=supported&&!media?.matches;
  if(!enabled){
    window.PEMESA_MOTION={refresh(){}};
    return;
  }

  const observer=new IntersectionObserver((entries)=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  },{rootMargin:'0px 0px -26px 0px',threshold:0.08});

  function refresh(){
    document.querySelectorAll(selector).forEach(el=>{
      if(el.dataset.motionObserved==='1')return;
      el.dataset.motionObserved='1';
      const children=Array.from(el.parentElement?.children||[]);
      const stagger=(
        el.matches('.feature-card,.step,.metric-card')
        ? Math.min(children.indexOf(el)*85,255)
        : 0
      );
      el.style.setProperty('--reveal-delay',stagger+'ms');
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
  }

  // Animations are opt-in to avoid hiding real content if this script fails to load.
  document.documentElement.classList.add('motion-enabled');
  window.PEMESA_MOTION={refresh};
  refresh();

  // Respect live operating-system changes without losing access to content.
  const handlePreference=event=>{
    if(event.matches){
      observer.disconnect();
      document.documentElement.classList.remove('motion-enabled');
      document.querySelectorAll('.reveal-on-scroll').forEach(el=>el.classList.add('is-visible'));
    }
  };
  media?.addEventListener?.('change',handlePreference);
})();
