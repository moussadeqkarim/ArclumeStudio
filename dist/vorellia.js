/* The page remains fully visible with JavaScript off. Only enhance the image. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const feature = document.querySelector('.feature-visual');
  const strip = document.querySelector('.offer-strip');
  const toggle = document.querySelector('.motion-toggle');
  toggle?.addEventListener('click', () => {
    const paused = strip.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
  });
  let pending = false;
  const update = () => {
    pending = false;
    if (!feature) return;
    if (motion.matches || innerWidth < 761) { feature.style.removeProperty('--feature-scale'); return; }
    const bounds = feature.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (innerHeight - bounds.top) / innerHeight));
    feature.style.setProperty('--feature-scale', String(.96 + progress * .04));
  };
  const requestUpdate = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll', requestUpdate, {passive:true});
  addEventListener('resize', requestUpdate, {passive:true});
  motion.addEventListener('change', requestUpdate);
  update();
})();
