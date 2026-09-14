# Connect project inquiries

The local frontend is implemented. Delivery is disabled until a real Formspree endpoint is configured. No receiving inbox or form account has been supplied yet.

1. Create a form in your Formspree account, name it “Arclume project inquiries,” and verify the receiving inbox.
2. Set `inquiryEndpoint` in `dist/config.js` to the form’s public `https://formspree.io/f/...` URL. This form ID is public; no account API key belongs in this file.
3. Set `contactEmail` to the public studio inbox for the direct-email fallback. This setting does not configure the recipient at Formspree; step 1 does that.
4. Configure server-side required-field rules for `name`, `email`, and `message`, with email validation and matching length limits (100, 254, 4000). Business (`brand`) is optional, max 200. Browser checks alone can be bypassed.
5. Configure the provider’s spam protection and allowed production domain. The frontend includes Formspree’s `_gotcha` honeypot. If the form requires a CAPTCHA, integrate its supported challenge flow before launch; this plain fetch implementation does not render a CAPTCHA widget.
6. Verify email notifications and Reply-To using the visitor’s `email` field. Confirm submissions are retained in the private dashboard and set the retention practice appropriate for the business. Update the draft privacy notice with the confirmed business details and retention practice.
7. Send a clearly labeled test inquiry after setup. Confirm it appears in the provider dashboard and arrives in the inbox, and verify Reply addresses the test client. Test a failed submission and retry. Provider acceptance alone does not prove email delivery.

The current preview has not been published or connected to a live form. Successful, failed, timeout, invalid-input and duplicate-click states are covered locally with mocked responses:

```sh
node --test scripts/test-inquiry.mjs
```

Implementation: `dist/inquiry.js`; form markup: `dist/index.html`; styling: `dist/refinement.css`. Regenerate policy pages with `node scripts/create-policy-pages.mjs` after editing their source.

Provider references: [AJAX submission](https://formspree.io/blog/formspree-ajax/), [Reply-To](https://help.formspree.io/articles/building-your-form/email-reply-to-address), [honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering), [server validation configuration](https://help.formspree.io/articles/using-the-cli/the-formspree-json-file).
