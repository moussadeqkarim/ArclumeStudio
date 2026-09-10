'use strict';
const config = window.ARCLUME_CONFIG || { contactEmail: '', socials: {} };
const studioEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail) ? config.contactEmail : '';
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
if (hero) {
  let ticking = false;
  const updateHero = () => {
    const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
    hero.style.setProperty('--hero-progress', progress.toFixed(3)); ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateHero); } }, { passive: true });
  reducedMotion.addEventListener('change', updateHero); updateHero();
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
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => openDialog(contactDialog, button)));
const projects = {
  expression: { title: 'In good form.', image: 'assets/yellow-satin.png', alt: 'Expressive yellow satin material study', description: 'A study in colour, texture and movement. One expressive material becomes the starting point for a distinctive visual world. An independent art direction experiment, open to many kinds of brands.', discipline: 'Brand art direction' },
  automotive: { title: 'After hours.', image: 'assets/automotive.png', alt: 'Silver coupe in an independent automotive concept', description: 'The road goes quiet. The form does the talking. An automotive direction built around precise light, clean silhouettes and the anticipation of a late-night drive. One industry exploration within a broader creative practice.', discipline: 'Automotive art direction' }
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
const form = document.getElementById('brief-form');
if (form) {
  if (studioEmail) {
    form.elements.name.required = true; form.elements.email.required = true; form.elements.brand.required = true;
    document.getElementById('contact-dialog-title').textContent = 'Tell us a little.';
    document.getElementById('contact-intro').textContent = 'A business, a launch, or the beginning of an idea.';
    form.querySelector('.form-submit').textContent = 'Continue to email ↗';
    document.getElementById('contact-note').replaceChildren('Opens your email app with your project details. Nothing is sent until you send the email. ');
    const privacyLink = document.createElement('a'); privacyLink.href = 'privacy.html'; privacyLink.textContent = 'Privacy policy'; document.getElementById('contact-note').append(privacyLink);
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); const values = new FormData(form);
    const text = `ARCLUME STUDIO — PROJECT BRIEF\n\nName: ${values.get('name')}\nEmail: ${values.get('email')}\nBusiness: ${values.get('brand')}\nService: ${values.get('service')}\n\nThe idea\n${values.get('idea')}\n`;
    const status = document.getElementById('form-status');
    if (studioEmail) {
      window.location.href = `mailto:${studioEmail}?subject=${encodeURIComponent('Project inquiry — ' + values.get('brand'))}&body=${encodeURIComponent(text)}`;
      status.textContent = 'Your email app should open with a draft. Send it there to contact us. If it does not open, email ' + studioEmail + ' directly.';
    } else {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = 'arclume-project-brief.txt'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Your brief has been downloaded. It has not been sent to Arclume Studio.';
    }
  });
}
