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
  let sending = false;
  const email = settings.contactEmail || '';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.textContent = email;
    fallback.replaceChildren('Prefer email? Contact ', link, '.');
    fallback.hidden = false;
  }
  button.disabled = !endpoint;
  if (!endpoint) {
    status.textContent = 'Online inquiries are not available yet. Nothing entered here will be sent.';
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
  document.getElementById('contact-dialog').addEventListener('close', () => {
    if (!success.hidden) {
      success.hidden = true;
      form.hidden = false;
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !endpoint || !form.reportValidity()) return;
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
