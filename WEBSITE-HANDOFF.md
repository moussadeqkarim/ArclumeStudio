# Vorellia website handoff

## Current conversion flow

The website no longer collects project inquiries through a form. Every primary contact action opens the Calendly scheduling dialog. The visitor can select a time in the embedded calendar or open the Calendly booking page in a new tab.

The calendar is loaded only after the visitor chooses a booking action. The public URL is configured in `dist/config.js` and validated before it is used. No inquiry data is collected by the Vorellia site, and no newsletter or marketing-email signup is active.

## Business and policy details

- Vorellia is a brand operated by Karim El Moussadeq in Ontario, Canada.
- The studio works with clients in Canada, Morocco and worldwide.
- Public privacy, accessibility and contact email: `hello@vorellia.com`.
- No mailing address is published.
- The site currently uses no Google Analytics, advertising pixels, newsletter, payment checkout or contact form.
- The footer links only to the supplied Instagram profile. Facebook and LinkedIn were removed.
- Privacy, Terms, Cookie and Accessibility pages are generated from `scripts/create-policy-pages.mjs`.

## What the controls do

| Control | Current behaviour |
| --- | --- |
| Vorellia wordmark | Returns to the homepage. |
| Work | Scrolls to creative examples; concepts open detail dialogs. |
| Services | Expands service descriptions. |
| Let’s talk / Book a call | Opens the Calendly scheduling dialog. |
| Open booking page in a new tab | Opens the configured Calendly event directly. |
| Instagram | Opens the confirmed Vorellia Instagram profile in a new tab. |
| Privacy / Terms / Cookies / Accessibility | Open separate readable policy pages. |

## Privacy and security notes

The policies describe the current calendar-only behavior. Calendly is loaded only when the visitor chooses scheduling, and Calendly’s own privacy and cookie practices apply to information entered in its booking flow. Public configuration contains no secret credentials.

The policies describe current behavior and should be reviewed by a qualified Canadian privacy or legal professional before a public launch. A policy page cannot guarantee compliance for every jurisdiction or business arrangement.

## Maintenance

- Public settings: `dist/config.js`
- Homepage and scheduling dialog: `dist/index.html`
- Navigation, project dialogs, social links and calendar behavior: `dist/script.js`
- Shared styling: `dist/refinement.css` and the other `dist/*.css` files
- Policy source: `scripts/create-policy-pages.mjs`

After changing the shared footer or policy wording, run:

```sh
node scripts/create-policy-pages.mjs
```

Before launch, test the embedded calendar, the new-tab fallback and the experience on a mobile viewport.
