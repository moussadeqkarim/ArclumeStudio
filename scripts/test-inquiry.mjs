import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const source = readFileSync(new URL('../dist/inquiry.js', import.meta.url), 'utf8');
function setup({ endpoint = 'https://formspree.io/f/testform', fetchResult, valid = true } = {}) {
  const element = () => ({ hidden: false, disabled: false, dataset: {}, handlers: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
    setAttribute() {}, removeAttribute() {}, replaceChildren() {}, focus() {},
    setCustomValidity(message) { this.error = message; }, reportValidity() { return valid; }
  });
  const ids = Object.fromEntries(['brief-form', 'form-status', 'inquiry-success', 'inquiry-email', 'new-inquiry', 'inquiry-success-title', 'contact-dialog'].map(id => [id, element()]));
  const form = ids['brief-form'], button = element(), fields = element();
  const values = { name: 'Test Client', email: 'client@example.com', brand: '', service: 'Content production', idea: 'A product launch campaign.', _gotcha: '' };
  form.elements = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { ...element(), value }]));
  form.querySelector = selector => selector === 'fieldset' ? fields : button;
  form.reset = () => { for (const field of Object.values(form.elements)) field.value = ''; };
  ids['inquiry-success'].hidden = true;
  const requests = [];
  const timers = new Set();
  runInNewContext(source, {
    window: { ARCLUME_CONFIG: { inquiryEndpoint: endpoint } },
    document: { getElementById: id => ids[id], createElement: element }, AbortController,
    FormData: class extends Map { constructor(f) { super(Object.entries(f.elements).map(([key, field]) => [key, field.value])); } },
    setTimeout(fn) { timers.add(fn); return fn; }, clearTimeout(fn) { timers.delete(fn); },
    fetch: async (url, options) => { requests.push({ url, options }); return fetchResult ? fetchResult(options) : { ok: true, json: async () => ({ ok: true }) }; }
  });
  return { ids, form, button, fields, requests, timers, submit: () => form.handlers.submit({ preventDefault() {} }) };
}
test('unconfigured and untrusted endpoints cannot submit', async () => {
  for (const endpoint of ['', 'http://formspree.io/f/test', 'https://example.com/f/test']) {
    const app = setup({ endpoint });
    await app.submit();
    assert.equal(app.button.disabled, true);
    assert.equal(app.requests.length, 0);
  }
});
test('invalid or whitespace-only inputs cannot submit', async () => {
  const invalid = setup({ valid: false }); await invalid.submit(); assert.equal(invalid.requests.length, 0);
  const blank = setup(); blank.form.elements.name.value = '  '; await blank.submit();
  assert.equal(blank.requests.length, 0); assert.ok(blank.form.elements.name.error);
});
test('accepted inquiry sends reply address and message, then clears the form', async () => {
  const app = setup(); await app.submit();
  assert.equal(app.requests[0].options.body.get('email'), 'client@example.com');
  assert.equal(app.requests[0].options.body.get('message'), 'A product launch campaign.');
  assert.equal(app.requests[0].options.body.get('brand'), '');
  assert.equal(app.ids['inquiry-success'].hidden, false);
  assert.equal(app.form.elements.idea.value, '');
  app.ids['contact-dialog'].handlers.close();
  assert.equal(app.form.hidden, false); assert.equal(app.ids['inquiry-success'].hidden, true);
});
test('server rejection, rate limit and malformed responses preserve answers', async () => {
  for (const response of [{ ok: false, status: 422 }, { ok: false, status: 429 }, { ok: true, status: 200 }]) {
    const app = setup({ fetchResult: async () => ({ ...response, json: async () => ({}) }) });
    await app.submit();
    assert.equal(app.form.elements.idea.value, 'A product launch campaign.');
    assert.equal(app.ids['inquiry-success'].hidden, true);
    assert.equal(app.ids['form-status'].dataset.state, 'error');
    assert.equal(app.button.disabled, false);
  }
});
test('network failure preserves answers and allows retry', async () => {
  const app = setup({ fetchResult: async () => { throw new Error('offline'); } });
  await app.submit(); await app.submit();
  assert.equal(app.requests.length, 2); assert.equal(app.fields.disabled, false);
  assert.match(app.ids['form-status'].textContent, /could not confirm/);
  assert.equal(app.form.elements.email.value, 'client@example.com');
});
test('pending requests block duplicate submission and timeout restores controls', async () => {
  const app = setup({ fetchResult: ({ signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))) });
  const pending = app.submit(); await app.submit();
  assert.equal(app.requests.length, 1); assert.equal(app.fields.disabled, true);
  for (const abort of app.timers) abort();
  await pending;
  assert.equal(app.fields.disabled, false); assert.equal(app.button.disabled, false);
  assert.equal(app.form.elements.idea.value, 'A product launch campaign.');
});
