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
const serviceNames = ['Cinematic or story-driven ad', 'Social media marketing', 'Brand or campaign direction', 'Content production', 'Website or landing page'];
const serviceDetails = [...document.querySelectorAll('.service-list > details')];
serviceDetails.forEach(detail => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  serviceDetails.forEach(other => {
    if (other !== detail && other.open) other.open = false;
  });
}));
document.querySelectorAll('.service-body').forEach((body, index) => {
  const button = document.createElement('button'); button.className = 'service-cta'; button.type = 'button';
  button.dataset.schedule = ''; button.dataset.service = serviceNames[index];
  button.setAttribute('aria-label', `Discuss ${serviceNames[index]} on a discovery call`);
  button.append(document.createTextNode('Discuss this service '));
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrow.setAttribute('class', 'arrow-icon'); arrow.setAttribute('viewBox', '0 0 16 16'); arrow.setAttribute('fill', 'none'); arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML = '<path d="M4 12 12 4M5 4h7v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />';
  button.append(arrow); body.append(button);
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
const projectDialog = document.getElementById('project-dialog');
const schedulerDialog = document.getElementById('scheduler-dialog');
const schedulerFrame = document.getElementById('scheduler-frame');
const schedulerStatus = document.getElementById('scheduler-status');
const schedulerLink = document.getElementById('scheduler-link');
const schedulerService = document.getElementById('scheduler-service');
let bookingUrl;
try {
  const url = new URL(config.calendlyUrl);
  if (url.protocol === 'https:' && url.hostname === 'calendly.com' && !url.username && !url.password) bookingUrl = url;
} catch { /* Missing or invalid configuration leaves booking unavailable. */ }
if (schedulerLink && bookingUrl) schedulerLink.href = bookingUrl.href;
let lastTrigger;
function openDialog(dialog, trigger) {
  if (!dialog) return;
  document.querySelectorAll('dialog[open]').forEach(open => open.close());
  lastTrigger = trigger; dialog.showModal();
}
function openScheduler(trigger) {
  if (!schedulerDialog || !bookingUrl) return;
  openDialog(schedulerDialog, trigger);
  const service = trigger?.dataset.service?.trim();
  if (schedulerService) {
    schedulerService.textContent = service ? `Booking about: ${service}` : '';
    schedulerService.hidden = !service;
  }
  if (!schedulerFrame || schedulerFrame.getAttribute('src')) return;
  const url = new URL(bookingUrl.href);
  url.searchParams.set('embed_domain', window.location.hostname);
  url.searchParams.set('embed_type', 'Inline');
  if (schedulerStatus) schedulerStatus.textContent = 'Loading available times…';
  schedulerFrame.src = url.href;
}
document.querySelectorAll('[data-schedule]').forEach(button => button.addEventListener('click', () => openScheduler(button)));
if (schedulerFrame) schedulerFrame.addEventListener('load', () => {
  if (schedulerStatus) schedulerStatus.textContent = 'Select a date and time below. If the calendar does not appear, use the booking link.';
});
const projects = {
  beverage: { title: 'Golden hour.', image: 'assets/espresso-concept.jpg', alt: 'Iced espresso on a yellow pedestal in an independent beverage concept', description: 'A familiar ritual, made a little extraordinary. Amber coffee, cold glass and a suspended droplet turn an everyday drink into a moment worth pausing for. An independent concept exploring product storytelling for food, drink and hospitality brands.', discipline: 'Beverage / Product art direction' },
  expression: { title: 'In good form.', image: 'assets/yellow-satin.png', alt: 'Expressive yellow satin material study', description: 'A study in colour, texture and movement. One expressive material becomes the starting point for a distinctive visual world. An independent art direction experiment, open to many kinds of brands.', discipline: 'Brand art direction' },
  lightform: { title: 'Lightform.', image: 'assets/lightform-concept-v2.jpg', alt: 'Translucent glass and folded paper illuminated by a golden beam in a dark studio', description: 'A visual world built from light, material and tension. Glass, paper and a single beam become a flexible starting point for a campaign, a product launch or a brand with something new to say.', discipline: 'Brand world / Art direction' }
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
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]') && lastTrigger?.isConnected) lastTrigger.focus(); });
});
