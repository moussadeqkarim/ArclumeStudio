'use strict';
// Set the verified studio inbox here to enable email inquiries.
const STUDIO_EMAIL = '';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-enabled');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const hero = document.querySelector('.hero');
let ticking = false;
function updateHero() {
  if (!reducedMotion.matches) {
    const progress = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
    hero.style.setProperty('--hero-progress', progress.toFixed(3));
  }
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateHero); } }, { passive: true });
updateHero();
document.getElementById('year').textContent = new Date().getFullYear();
const contactDialog = document.getElementById('contact-dialog');
const projectDialog = document.getElementById('project-dialog');
let lastTrigger;
function openDialog(dialog, trigger) {
  document.querySelectorAll('dialog[open]').forEach(open => open.close());
  lastTrigger = trigger;
  dialog.showModal();
}
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => openDialog(contactDialog, button)));
document.querySelector('[data-project]').addEventListener('click', event => openDialog(projectDialog, event.currentTarget));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { if (lastTrigger?.isConnected && !lastTrigger.closest('dialog:not([open])')) lastTrigger.focus(); });
});
const form = document.getElementById('brief-form');
if (STUDIO_EMAIL) {
  form.querySelector('.form-submit').textContent = 'Continue to email ↗';
  document.getElementById('contact-note').textContent = 'Opens your email app with your project details. Nothing is sent until you send the email.';
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(form);
  const text = `ARCLUME STUDIO — PROJECT INQUIRY\n\nName: ${values.get('name')}\nEmail: ${values.get('email')}\nBrand: ${values.get('brand')}\n\nThe idea\n${values.get('idea')}\n`;
  const status = document.getElementById('form-status');
  if (STUDIO_EMAIL) {
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent('Project inquiry — ' + values.get('brand'))}&body=${encodeURIComponent(text)}`;
    status.textContent = 'Your draft is ready in your email app. Send it there to get in touch.';
  } else {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'arclume-project-brief.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Your brief has been downloaded. It has not been sent to the studio.';
  }
});
