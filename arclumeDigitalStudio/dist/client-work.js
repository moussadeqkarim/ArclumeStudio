'use strict';
(() => {
  const reel = document.querySelector('.client-marquee');
  const group = reel?.querySelector('.client-image-group');
  const toggle = document.querySelector('.gallery-toggle');
  if (!reel || !group || !toggle) return;
  // Equal-width groups make the right-to-left loop seamless.
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.querySelectorAll('img').forEach(image => { image.alt = ''; });
  group.parentElement.append(duplicate);
  reel.classList.add('is-ready');
  toggle.addEventListener('click', () => {
    const paused = reel.classList.toggle('is-paused');
    if (!paused) reel.scrollLeft = 0;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.innerHTML = paused ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  });
  // Resume from the animated position after manual browsing.
  reel.addEventListener('mouseleave', () => {
    if (!reel.classList.contains('is-paused') && !reel.matches(':focus-within')) reel.scrollLeft = 0;
  });
  reel.addEventListener('focusout', () => {
    if (!reel.classList.contains('is-paused')) reel.scrollLeft = 0;
  });
})();
