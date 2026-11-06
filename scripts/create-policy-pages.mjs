import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const home = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const footer = home.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0]
  .replaceAll('href="#', 'href="index.html#')
  .replace('<button data-schedule>Book a call</button>', '<a href="index.html#contact">Book a call</a>');
const updated = 'Updated November 5, 2026';
const contact = '<p>Questions, privacy requests, deletion requests and accessibility feedback can be sent to <a href="mailto:hello@vorellia.com">hello@vorellia.com</a>.</p>';
const pages = [
  {
    file: 'privacy.html', title: 'Privacy policy', intro: 'A clear explanation of what happens to your information on this website.',
    body: `<h2>Who this notice is about</h2><p>Vorellia is a creative brand operated by Karim El Moussadeq in Ontario, Canada. Vorellia works with clients in Canada, Morocco and other countries. This notice explains how information is handled through the Vorellia website.</p>
    <h2>Booking a conversation</h2><p>The site does not operate an inquiry form. When you choose to book a call, the site loads Calendly and you enter the information needed to schedule a meeting. Calendly processes that information under its own notices, including its <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>
    <h2>Website delivery and technical information</h2><p>Netlify and other infrastructure providers may process technical information such as IP address, browser information and request logs to deliver and protect the website. Vorellia does not currently use Google Analytics, advertising pixels, embedded social feeds, a contact form or a newsletter platform.</p>
    <h2>External links</h2><p>The Instagram link opens an external platform. Instagram’s terms and privacy practices apply after you leave this site.</p>
    <h2>Privacy requests</h2><p>You can request access, correction or deletion of information held by Vorellia by emailing <a href="mailto:hello@vorellia.com">hello@vorellia.com</a>. We may need to verify the request and may retain limited information where the law permits or requires it. Information entered directly into Calendly is handled according to Calendly’s own retention and privacy practices.</p>
    <h2>International clients and processing</h2><p>Because Vorellia works internationally and relies on service providers, information may be processed in Canada or other countries where those providers operate. The relevant provider notices describe their safeguards and handling practices.</p>
    <h2>Security and updates</h2><p>The site uses HTTPS and reasonable measures are taken to protect the website. No online service can guarantee complete security. This notice will be updated when the information practices or service providers change.</p>${contact}`
  },
  {
    file: 'terms.html', title: 'Terms of service', intro: 'Website use, creative examples and the first step toward working together.',
    body: `<h2>Scope of these terms</h2><p>These terms cover the Vorellia website and its scheduling link. Vorellia is a brand operated by Karim El Moussadeq in Ontario, Canada. These terms are not a client production agreement, confirmed quote or booking.</p>
    <h2>Using the website</h2><p>You may browse the site and book a conversation for a legitimate purpose. Do not submit unlawful, deceptive or malicious material, impersonate another person, interfere with the site or attempt unauthorized access.</p>
    <h2>Creative work and examples</h2><p>Images and campaigns identified as studio concepts, references or studies are creative explorations and are not claims of a paid client relationship, endorsement or measured campaign result. Third-party names, products and marks remain the property of their respective owners.</p><p>Website copy, layouts and original Vorellia creative material may be protected by intellectual-property rights. Viewing the site does not grant a commercial reuse licence.</p>
    <h2>Scheduling and proposals</h2><p>Booking a Calendly call reserves time to talk; it is not an accepted quote, project booking or commitment to payment. Before work begins, both parties should agree in writing on scope, deliverables, schedule, fees, payment milestones, revisions, cancellation, confidentiality, licensing and usage rights.</p><p>Vorellia does not take payments through this website, and this website does not establish a standalone refund policy. Any deposits, refunds or cancellation terms will be stated in the applicable project agreement.</p>
    <h2>Supplied materials and campaign outcomes</h2><p>Only share materials you are entitled to provide. Do not place passwords, payment information or confidential credentials in the calendar booking. Vorellia does not promise a particular number of views, leads, sales or return on advertising spend; outcomes depend on the offer, audience, media spend, distribution and market conditions.</p>
    <h2>Availability, external services and governing law</h2><p>Website information may change and access may occasionally be interrupted. Netlify, Calendly and Instagram are independent services with their own terms. These terms are intended to be interpreted under the laws applicable in Ontario, Canada, except where mandatory consumer or privacy law says otherwise.</p>${contact}`
  },
  {
    file: 'cookies.html', title: 'Cookie notice', intro: 'What this site stores—and what it does not.',
    body: `<h2>What Vorellia’s code does</h2><p>The current site does not set first-party cookies, use localStorage or sessionStorage, use Google Analytics, or run advertising pixels. The site does not operate a contact form.</p>
    <h2>Hosting and scheduling</h2><p>Netlify may use cookies or similar technical mechanisms for hosting and security. Calendly is loaded only after you choose to schedule a meeting and may use cookies or similar technologies under its own notices.</p>
    <h2>Instagram</h2><p>Instagram is an external link rather than an embedded feed; its cookie and privacy notices apply after you leave Vorellia’s site.</p>
    <h2>Your choices and future changes</h2><p>You can manage cookies through your browser settings. There is currently no non-essential advertising or analytics cookie preference to toggle, so no cookie-consent banner is displayed. If Vorellia adds analytics, advertising pixels, embedded media or other non-essential tracking, this notice and any required consent controls will be updated before activation.</p>${contact}`
  },
  {
    file: 'accessibility.html', title: 'Accessibility', intro: 'A site you can explore in the way that works for you.',
    body: `<h2>Features included</h2><p>The site includes a skip-to-content link, semantic headings, visible keyboard focus, descriptive image text, responsive layouts and native disclosure controls. The scheduling dialog has a labeled calendar frame, a visible fallback link and can be closed with Escape.</p>
    <h2>Motion preferences</h2><p>Animated sections include reduced-motion fallbacks. When your device or browser requests reduced motion, the site disables scroll zoom, entrance transitions and looping motion where practical. No audio plays automatically.</p>
    <h2>Keyboard and mobile use</h2><p>Use Tab and Shift+Tab to move through controls, Enter or Space to activate controls and Escape to close an open dialog. Layouts are adapted for smaller screens rather than relying on desktop-only interactions.</p>
    <h2>Ongoing review</h2><p>These features describe the current implementation and are not a claim of formal accessibility certification. Vorellia continues to review the site across browsers, devices and assistive technologies.</p>
    <h2>Report a barrier</h2><p>If something makes the website difficult to use, email <a href="mailto:hello@vorellia.com">hello@vorellia.com</a> with the page, device or browser, and the action you were trying to complete. Please do not include sensitive personal information.</p>`
  }
];
for (const page of pages) {
  writeFileSync(resolve(root, 'dist', page.file), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#080808"><meta name="description" content="${page.intro}"><title>${page.title} — Vorellia</title><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="agency.css"><script src="config.js" defer></script><script src="script.js" defer></script></head>
<body class="policy-page"><a class="skip" href="#main">Skip to content</a><header class="header"><a class="wordmark" href="index.html" aria-label="Vorellia home">vorellia<small>CREATIVE STUDIO</small></a><nav aria-label="Main navigation"><a href="index.html">Back to the studio ↗</a></nav></header><main id="main" class="policy-content"><p class="eyebrow">VORELLIA / THE DETAILS</p><h1>${page.title}</h1><p class="policy-intro">${page.intro}</p><p class="policy-date">${updated}</p><div class="policy-text">${page.body}</div></main>${footer}</body></html>`, 'utf8');
}
console.log('Created 4 Vorellia policy pages with shared navigation and footer.');
