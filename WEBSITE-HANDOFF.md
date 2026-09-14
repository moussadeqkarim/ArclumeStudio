# Arclume Studio — website handoff

## September 14 inquiry update — current behavior

This update supersedes the draft-download and email-draft descriptions below. Save and Copy have been replaced with Send inquiry. Name, email and project idea are required; business is optional. The frontend supports Formspree submission, pending state, confirmation after acceptance, and retries that preserve answers. The endpoint and receiving email are still unset, so sending is disabled in the preview. Provider-side validation, spam settings, inbox/dashboard delivery and retention remain to be configured and verified. See [INQUIRY-SETUP.md](INQUIRY-SETUP.md). Six mocked behavior tests pass; the form and service preselection were checked in the local browser. No live delivery test or publication has occurred.

Updated September 13, 2026. This is a private design preview, not a public launch.

## September 13 refinement

- Centered hero, translucent fixed navigation, responsive mobile menu, rounded project images and more deliberate spacing.
- Added a continuous downward services reel. Pause/Resume works immediately; reduced-motion users see a static list.
- Added a beverage concept alongside the automotive concept to demonstrate broader creative direction.
- Service inquiry buttons preselect the relevant service. Added FAQs and a Copy brief action alongside the existing download.
- Checked desktop and 390px mobile layouts, menu navigation, project dialogs, service selection and local brief download. No horizontal overflow or broken images at the checked mobile width.
- The active name remains a temporary label until a replacement is chosen. See NAMING-NOTES.md.

### Still needed from you

1. Receiving email address: set `contactEmail` in `dist/config.js` to enable email drafts. A visitor must send the draft in their email app. Direct website submission would require a separate form backend.
2. Instagram, Facebook and optionally LinkedIn URLs: set the matching entries in `dist/config.js`. Blank entries remain non-clickable Coming soon labels.
3. Final business name and legal business details for the wordmark, page titles, downloads, favicon, policies and hosting address.
4. Real finished ads or case studies and permission to showcase them. Current imagery is clearly labeled independent concepts.
5. Any booking link you want to use, plus confirmation of pricing, delivery promises and policies before public launch.

## What changed

- The agency serves different types of businesses; the car is one independent concept, not the studio’s specialty.
- The main image is a yellow material study. The black, white and yellow direction, large typography, scroll animation and generous spacing remain.
- The decorative star was removed from the wordmark. It had no established brand or certification meaning.
- The services now cover cinematic and story-driven ads, social media marketing, brand and campaign direction, and content production.
- Work contains two clearly labeled concept stills. These are not finished films, paid client work or proven campaign results.
- Added Instagram, Facebook and LinkedIn spaces plus Privacy, Terms, Cookies and Accessibility pages.

## What the controls do

| Control | Current behaviour |
| --- | --- |
| Arclume wordmark | Returns to the top/homepage. |
| Work | Scrolls to the creative examples. Each concept opens its own detail window. |
| Services | Scrolls to the service descriptions. Each row expands or collapses. |
| About, previously Studio | Scrolls to the introduction to the agency. |
| Let’s talk / Start a project | Opens the project brief form. |
| Save brief to my device | Downloads a text file containing the visitor’s answers. It does not send an inquiry. |
| Social profiles | Show Coming soon until real profile URLs are supplied. They do not link to guessed accounts. |
| Privacy / Terms / Cookies / Accessibility | Open separate, readable pages. |

## Project inquiries: current state and proposed next step

Currently, the brief exists only in the visitor’s page and in their downloaded file. It is not sent to the agency, stored in a CRM, emailed automatically or added to a mailing list. The idea is required; contact details are optional while the form only creates a personal draft.

The simpler next option is an email draft: after a verified studio inbox is added, the form validates the visitor’s name, email, business and idea, then opens their email app with a prepared message. The visitor still has to press Send in that app. There is no server-side submission confirmation.

The recommended public-launch flow is direct website submission: visitor fills out the form → server validates it → an email service sends the inquiry to your verified inbox → the website confirms receipt only after the service accepts it. A failed delivery must preserve the visitor’s answers and show a retry option. This backend is not implemented in the current static site. It needs an inbox, a chosen email service, server-side credentials, spam protection and a tested delivery path. A durable inbox or CRM can be added if you want records separate from email.

An inquiry should not be treated as newsletter consent. No newsletter, analytics, advertising pixel, payment checkout or scheduling service is currently installed.

## Details to provide or decide

| Priority | Your input | What will be adjusted |
| --- | --- | --- |
| Before public launch | Studio contact email and preferred inquiry flow | Connect real inquiries and update the form/privacy text. |
| Before public launch | Legal business name, operating country/province and business contact address | Complete the policy identity and jurisdiction details. No home address is assumed or published. |
| Before public launch | Privacy contact and retention practice for received inquiries | Complete the access/deletion process, retention schedule and provider disclosures. |
| Before public launch | Review of draft terms and privacy pages for your actual business | Finalize policy text and remove the draft notices. The site terms are not a client contract. |
| When ready | Instagram, Facebook and LinkedIn URLs | Turn the pending social labels into real links. Remove any platform you do not use. |
| Next visual pass | Your reference screenshots | Refine imagery and page composition around the look you have in mind. |
| Portfolio pass | Your own ads, videos and permission to show client work | Replace or supplement concept stills with real projects, accurate credits and case studies. |
| Service confirmation | Whether you offer posting, community management, media buying or ad optimization | Expand the scope only to services you actually deliver. Current social copy focuses on strategy, content planning and campaign creative. |
| Launch | Custom domain and public access decision | Connect the domain and make the approved site available to prospects. It is currently private. |
| If tracking is added | Analytics/ad platform choice and consent requirements | Add the integration and update privacy/cookie notices and consent controls before enabling it. |

## Policy and security notes

The policy pages are tailored drafts describing this site’s actual current operation. They do not claim blanket legal compliance or a security certification. Received-inquiry retention, legal identity and privacy contact are not invented. Hosting may have its own authentication cookies and technical logs; the page’s own code uses no cookies, browser storage, ad pixels or analytics. Fonts now come from the visitor’s device, avoiding an external font request.

HTTPS is supplied by hosting. Client-side field limits and browser validation improve the interface but would not replace server validation or spam protection for a live submission service. No secret credentials belong in public configuration.

The draft approach follows the Canadian privacy regulator’s guidance to clearly explain what information is handled, why and with whom: [OPC consent guidance](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent/). Business location still needs confirmation; this is not a conclusion that one law covers every visitor or activity. Marketing email consent is a separate issue from responding to a requested inquiry: [CRTC CASL information session](https://www.crtc.gc.ca/eng/com500/info.htm).

## Maintenance

Public settings are in `dist/config.js`: verified contact inbox and social URLs. Adding an inbox enables the email-draft flow; it does not create a direct submission backend. The privacy notice anticipates both draft download and email-draft modes. Direct submission requires a separate implementation and corresponding notice update.

Policy page source is maintained in `scripts/create-policy-pages.mjs`; rerun it after policy edits or shared footer changes. Homepage copy and form markup are in `dist/index.html`, behaviour is in `dist/script.js`, and styling is in `dist/styles.css`.

## Validation

Source checks cover JavaScript syntax, local assets, inter-page and section links, unique IDs and relevant form behaviour. No claim of browser visual QA or formal accessibility conformance is made. A full device and assistive-technology review is still appropriate before public launch.
