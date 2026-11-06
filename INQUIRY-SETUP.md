# Scheduling setup

The website no longer collects project inquiries through a form. All primary calls to action open the Calendly scheduling dialog.

1. Confirm the public Calendly event URL in `dist/config.js`.
2. Confirm the event duration, availability, intake questions and confirmation emails in Calendly.
3. Test the embedded calendar and the “Open booking page in a new tab” fallback on desktop and mobile.
4. Do not enable Netlify Forms unless a future version intentionally adds an inquiry form.

Implementation: the scheduling dialog is in `dist/index.html`; its open/lazy-load behavior is in `dist/script.js`; the Calendly URL is in `dist/config.js`.
