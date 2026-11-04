# Vorellia visual direction

Vorellia is the public brand. The legacy `ARCLUME_CONFIG` settings key is retained to preserve inquiry and booking integrations.

The buildless HTML/CSS/JavaScript stack and `dist/` deployment directory are unchanged. No framework, runtime dependency, external fonts or 3D library was added. Existing imagery is reused; studio studies remain explicitly identified as concepts.

## Design system

- Paper `#fafaf9`, ink `#20211f`, secondary text `#62645f`, surface `#efefec`, border `#deded9`, yellow `#e8d35e`.
- Helvetica Neue / Helvetica / Arial: one restrained sans-serif family, with fluid display sizes and comfortable body text.
- The homepage uses `vorellia.css` directly. Companion pages retain their existing layout sheets and load `vorellia.css` last for shared branding and contrast.
- The hero pairs product imagery with a direct description of the studio offer. Concept projects use an asymmetric composition. Services use the existing exclusive accordion.
- No fixed-height text scenes or overlapping scroll layers. Content remains visible without JavaScript.

## Motion and performance

One passive, requestAnimationFrame-controlled scroll listener adjusts the feature image scale on desktop. Mobile omits the effect. The CSS service loop has a pause control. Both respect reduced motion; hover scaling and dialog entry also stop under reduced motion.

The two concept images are JPEG delivery variants (348 KB combined), replacing 3.6 MB of PNG downloads on the homepage. Originals remain available. Lower-page imagery loads lazily, while hero images reserve their layout space.

## Validation

Run `node --check dist/vorellia.js`, `node --check dist/script.js`, and `node scripts/test-inquiry.mjs`. Preview with `node scripts/preview.mjs`.

Test desktop and mobile screenshots, 320px overflow, mobile menu, service switching, inquiry service preselection, project dialogs, companion-page contrast and service-loop pause. Existing contact email and Calendly configuration are preserved.
