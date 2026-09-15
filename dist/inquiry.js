'use strict';
(() => {
  const form = document.getElementById('brief-form');
  if (!form) return;
  const settings = window.ARCLUME_CONFIG || {};
  const endpoint = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(settings.inquiryEndpoint || '') ? settings.inquiryEndpoint : '';
  const button = form.querySelector('.form-submit');
  const status = document.getElementById('form-status');
  const fields = form.querySelector('fieldset');
  const success = document.getElementById('inquiry-success');
  const fallback = document.getElementById('inquiry-email');
  const scheduler = document.getElementById('scheduler-dialog');
  let sending = false;
  const email = settings.contactEmail || '';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.textContent = email;
    fallback.replaceChildren('Prefer email? Contact ', link, '.');
    fallback.hidden = false;
  }
  const emailFallback = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  button.disabled = !endpoint && !emailFallback;
  if (!endpoint && !emailFallback) {
    status.textContent = 'Online inquiries are not available yet. Nothing entered here will be sent.';
  } else if (!endpoint && emailFallback) {
    status.textContent = 'Your email app will open with a prepared inquiry. Nothing is sent until you press Send.';
  }
  const showStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };
  document.getElementById('new-inquiry').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
  const schedulerButton = document.getElementById('open-scheduler');
  const schedulerFrame = document.getElementById('scheduler-frame');
  const schedulerStatus = document.getElementById('scheduler-status');
  const schedulerLink = document.getElementById('scheduler-link');
  let bookingUrl;
  try {
    const url = new URL(settings.calendlyUrl);
    if (url.protocol === 'https:' && url.hostname === 'calendly.com' && !url.username && !url.password) bookingUrl = url;
  } catch { /* Missing or invalid configuration leaves booking unavailable. */ }
  if (schedulerButton) schedulerButton.disabled = !bookingUrl;
  if (schedulerLink && bookingUrl) schedulerLink.href = bookingUrl.href;
  schedulerButton?.addEventListener('click', () => {
    if (!scheduler || !schedulerFrame || !bookingUrl) return;
    document.getElementById('contact-dialog').close();
    scheduler.showModal();
    if (!schedulerFrame.getAttribute('src')) {
      const url = new URL(bookingUrl.href);
      url.searchParams.set('embed_domain', window.location.hostname);
      url.searchParams.set('embed_type', 'Inline');
      schedulerStatus.textContent = 'Loading available times…';
      schedulerFrame.src = url.href;
    }
  });
  schedulerFrame?.addEventListener('load', () => {
    schedulerStatus.textContent = 'Select a date and time below. If the calendar does not appear, use the booking link.';
  });
  scheduler?.addEventListener('close', () => {
    const contact = document.getElementById('contact-dialog');
    if (!contact.open) contact.showModal();
    schedulerButton?.focus();
  });
  document.getElementById('contact-dialog').addEventListener('close', () => {
    if (!success.hidden) {
      success.hidden = true;
      form.hidden = false;
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || (!endpoint && !emailFallback) || !form.reportValidity()) return;
    for (const name of ['name', 'email', 'idea']) {
      const field = form.elements[name];
      if (!field.value.trim()) {
        field.setCustomValidity('Please complete this field.');
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
        return;
      }
    }
    const payload = new FormData(form);
    payload.set('name', form.elements.name.value.trim());
    payload.set('email', form.elements.email.value.trim());
    payload.set('message', form.elements.idea.value.trim());
    payload.delete('idea');
    payload.set('subject', 'New project inquiry — Arclume Studio');
    if (!endpoint && emailFallback) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent('New project inquiry — ' + (form.elements.brand.value.trim() || 'Arclume Studio'))}&body=${encodeURIComponent([...payload.entries()].map(([key, value]) => `${key}: ${value}`).join('\n'))}`;
      showStatus(`Your email app should open with a draft. Press Send to contact Arclume at ${email}.`, 'pending');
      return;
    }
    sending = true;
    fields.disabled = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    showStatus('Sending your inquiry…', 'pending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', body: payload, headers: { Accept: 'application/json' },
        signal: controller.signal, credentials: 'omit'
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        showStatus(response.status === 429
          ? 'Too many attempts. Please wait a few minutes before trying again. Your answers are still here.'
          : 'Your inquiry could not be confirmed. Your answers are still here. Try again or contact us by email.', 'error');
        return;
      }
      form.reset();
      showStatus('', '');
      form.hidden = true;
      success.hidden = false;
      document.getElementById('inquiry-success-title').focus();
    } catch {
      showStatus('We could not confirm whether your inquiry arrived. Your answers are still here. Check your connection, then retry or contact us by email.', 'error');
    } finally {
      clearTimeout(timeout);
      sending = false;
      fields.disabled = false;
      button.disabled = false;
      button.textContent = 'Send inquiry ↗';
      form.removeAttribute('aria-busy');
    }
  });
})();
