/* One short desktop story; every image remains available without enhancement. */
(() => {
  document.querySelectorAll('.capability-nav a').forEach(link => {
    link.addEventListener('click', () => {
      const service = document.getElementById(link.hash.slice(1));
      if (service?.tagName === 'DETAILS') service.open = true;
    });
  });
  const stage = document.querySelector('[data-campaign-story]');
  if (!stage || !window.gsap) return;
  const button = stage.querySelector('.story-motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width:1100px) and (min-height:700px)');
  let disabled = false, loading, media, revision = 0;

  function loadScrollTrigger() {
    if (window.ScrollTrigger) return Promise.resolve();
    if (!loading) loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/ScrollTrigger.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    return loading;
  }

  async function sync() {
    const currentRevision = ++revision;
    media?.revert();
    media = null;
    stage.classList.remove('is-scroll-story');
    button.hidden = !desktop.matches || preference.matches;
    button.textContent = disabled ? 'Turn on scroll effects' : 'Turn off scroll effects';
    button.setAttribute('aria-pressed', String(disabled));
    if (!desktop.matches || preference.matches || disabled) return;
    try {
      await loadScrollTrigger();
      if (currentRevision !== revision || !desktop.matches || preference.matches || disabled) return;
      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add('(min-width:1100px) and (min-height:700px) and (prefers-reduced-motion:no-preference)', () => {
        stage.classList.add('is-scroll-story');
        const composition = stage.querySelector('.campaign-composition');
        const detail = stage.querySelector('.campaign-frame-detail');
        const ritual = stage.querySelector('.campaign-frame-ritual');
        const image = stage.querySelector('.campaign-frame-hero img');
        const timeline = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
          trigger:stage, start:'top 40px', end:() => '+=' + Math.round(innerHeight * .85),
          pin:true, scrub:.45, anticipatePin:1, invalidateOnRefresh:true
        }});
        timeline.fromTo(composition,{scale:.94},{scale:1,duration:.4},0)
          .fromTo(detail,{autoAlpha:0,y:45},{autoAlpha:1,y:28,duration:.38},.16)
          .fromTo(ritual,{autoAlpha:0,y:0},{autoAlpha:1,y:-24,duration:.38},.25)
          .fromTo(image,{scale:1.18},{scale:1.28,duration:.65},.08)
          .to({}, {duration:.15});
        return () => stage.classList.remove('is-scroll-story');
      });
    } catch {
      button.hidden = true; // The complete static composition is already in HTML.
    }
  }
  button.addEventListener('click', () => {disabled = !disabled;sync();});
  preference.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  // Load the small plugin near the story, not on the hero's critical path.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {observer.disconnect();sync();}
    },{rootMargin:'500px'});
    observer.observe(stage);
  } else sync();
})();
