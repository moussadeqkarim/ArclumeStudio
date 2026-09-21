'use strict';
const config = window.ARCLUME_CONFIG || { contactEmail: '', socials: {} };
const studioEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail) ? config.contactEmail : '';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
function closeMenu() { mainNav?.classList.remove('is-open'); menuToggle?.setAttribute('aria-expanded', 'false'); }
menuToggle?.addEventListener('click', () => { const open = mainNav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
mainNav?.querySelectorAll('a,button').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && mainNav?.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); } });
document.querySelector('.reel-toggle')?.addEventListener('click', event => {
  const button = event.currentTarget; const paused = button.closest('.reel-panel').classList.toggle('is-paused');
  button.setAttribute('aria-pressed', String(paused)); button.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
});
const serviceNames = ['Cinematic or story-driven ad', 'Social media marketing', 'Brand or campaign direction', 'Content production', 'Web development'];
const serviceDetails = [...document.querySelectorAll('.service-list > details')];
serviceDetails.forEach(detail => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  serviceDetails.forEach(other => {
    if (other !== detail && other.open) other.open = false;
  });
}));
document.querySelectorAll('.service-body').forEach((body, index) => {
  const button = document.createElement('button'); button.className = 'service-cta'; button.type = 'button';
  button.dataset.contact = ''; button.dataset.service = serviceNames[index]; button.textContent = 'Discuss this service ↗'; body.append(button);
});
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-enabled');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
/* One passive scroll listener drives every sticky sequence. Reads and writes
   happen inside one rAF so the animation stays compositor-friendly. */
const cinematicSequences = [...document.querySelectorAll('[data-sequence]')];
if (cinematicSequences.length) {
  const heroKeywords = [...document.querySelectorAll('.hero-keyword')];
  const heroExclusions = () => [
    document.querySelector('.hero-phone-wrap'),
    document.querySelector('.hero-copy .eyebrow'),
    document.querySelector('.hero-copy h1'),
    document.querySelector('.hero-copy .hero-bottom')
  ].filter(Boolean).map(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left - 8, top: rect.top - 8, right: rect.right + 8, bottom: rect.bottom + 8 };
  });
  const updateHeroKeywords = () => {
    if (!heroKeywords.length) return;
    const exclusions = heroExclusions();
    heroKeywords.forEach(keyword => {
      const rect = keyword.getBoundingClientRect();
      const overlaps = exclusions.some(exclusion => (
        rect.left < exclusion.right && rect.right > exclusion.left &&
        rect.top < exclusion.bottom && rect.bottom > exclusion.top
      ));
      keyword.classList.toggle('is-hidden', overlaps);
    });
  };
  let ticking = false;
  let viewportHeight = window.innerHeight;
  const updateSequences = () => {
    cinematicSequences.forEach(sequence => {
      const progress = reducedMotion.matches
        ? 1
        : Math.min(1, Math.max(0, -sequence.getBoundingClientRect().top / Math.max(1, sequence.offsetHeight - viewportHeight)));
      const value = progress.toFixed(3);
      sequence.style.setProperty('--scroll-progress', value);
      /* Keep the legacy variable available for any existing hero overrides. */
      if (sequence.dataset.sequence === 'hero') sequence.style.setProperty('--hero-progress', value);
    });
    updateHeroKeywords();
    ticking = false;
  };
  const requestSequenceUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateSequences);
  };
  window.addEventListener('scroll', requestSequenceUpdate, { passive: true });
  window.addEventListener('resize', () => { viewportHeight = window.innerHeight; requestSequenceUpdate(); }, { passive: true });
  reducedMotion.addEventListener('change', requestSequenceUpdate);
  requestSequenceUpdate();
}
document.querySelectorAll('#year').forEach(element => { element.textContent = new Date().getFullYear(); });
document.querySelectorAll('[data-social]').forEach(element => {
  const value = config.socials?.[element.dataset.social];
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return;
    const link = document.createElement('a'); link.href = url.href;
    link.textContent = element.dataset.social === 'linkedin' ? 'LinkedIn' : element.dataset.social.charAt(0).toUpperCase() + element.dataset.social.slice(1);
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', link.textContent + ' — opens in a new tab'); element.replaceWith(link);
  } catch { /* Invalid URLs leave the pending label in place. */ }
});
document.querySelectorAll('[data-policy-contact]').forEach(element => {
  if (studioEmail) { const link = document.createElement('a'); link.href = `mailto:${studioEmail}`; link.textContent = studioEmail; element.replaceChildren(link); }
});
const contactDialog = document.getElementById('contact-dialog');
const projectDialog = document.getElementById('project-dialog');
let lastTrigger;
function openDialog(dialog, trigger) {
  if (!dialog) return;
  document.querySelectorAll('dialog[open]').forEach(open => open.close());
  lastTrigger = trigger; dialog.showModal();
}
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.service) document.getElementById('brief-form').elements.service.value = button.dataset.service;
  openDialog(contactDialog, button);
}));
const projects = {
  beverage: { title: 'Golden hour.', image: 'assets/espresso-concept.png', alt: 'Iced espresso on a yellow pedestal in an independent beverage concept', description: 'A familiar ritual, made a little extraordinary. Amber coffee, cold glass and a suspended droplet turn an everyday drink into a moment worth pausing for. An independent concept exploring product storytelling for food, drink and hospitality brands.', discipline: 'Beverage / Product art direction' },
  expression: { title: 'In good form.', image: 'assets/yellow-satin.png', alt: 'Expressive yellow satin material study', description: 'A study in colour, texture and movement. One expressive material becomes the starting point for a distinctive visual world. An independent art direction experiment, open to many kinds of brands.', discipline: 'Brand art direction' },
  lightform: { title: 'Lightform.', image: 'assets/lightform-concept.png', alt: 'Translucent glass and folded paper illuminated by a golden beam in a dark studio', description: 'A visual world built from light, material and tension. Glass, paper and a single beam become a flexible starting point for a campaign, a product launch or a brand with something new to say.', discipline: 'Brand world / Art direction' }
};
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project]; if (!project || !projectDialog) return;
  const image = document.getElementById('project-detail-image'); image.src = project.image; image.alt = project.alt;
  document.getElementById('project-dialog-title').textContent = project.title;
  document.getElementById('project-detail-description').textContent = project.description;
  document.getElementById('project-detail-discipline').textContent = project.discipline;
  openDialog(projectDialog, button);
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]') && lastTrigger?.isConnected) { if (!lastTrigger.closest('dialog:not([open])')) lastTrigger.focus(); else document.querySelector('.nav-contact')?.focus(); } });
});
