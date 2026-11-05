# Vorellia

An independent creative studio website for cinematic advertising, social media marketing, campaign direction, content production and websites. Photography-led editorial design, restrained motion, and responsive layouts. See [VORELLIA-DESIGN.md](VORELLIA-DESIGN.md) for the visual system and validation notes.

## Preview locally

No dependency installation or build is required. From this folder run:

```sh
python -m http.server 5173 --directory dist
```

Open http://localhost:5173.

## Live motion

`dist/motion-studio.js` controls playback for the service showcase and the independent work preview. GSAP drives the campaign/content layers and smooths hero scroll input. `dist/sculpture-3d.js` routes the new hero to `dist/hero-ribbon.js`; the independent work preview retains its own renderer. Engine files and licenses are in `dist/vendor`.

The 3D engine loads when a preview approaches the viewport. Rendering stops offscreen, in background tabs and when paused. Hero mobile pixel density is capped at 1.5. Reduced-motion visitors get a still from the actual final ribbon render, without loading the hero WebGL scene. The same poster is visible without JavaScript or WebGL. Selecting a service preserves the visitor’s playback preference.

The hero is a completely new open sculptural glass band with an asymmetric V-like fold. Its original surface and twist deform on an exact 14-second periodic cycle, with restrained cursor perspective and scroll positioning. Closed tapered tips and smoothed surface seams catch a custom three-panel studio environment. The glass uses physical transmission, soft refraction, violet absorption and a subtle lavender rim. The previous DNA geometry and particles are removed.

`node scripts/test-motion-browser.cjs` checks the 14-second loop closure, four phase screenshots, cursor/scroll views, pause/resume, both motion controls, responsive widths, reduced motion, and no-WebGL/no-JS posters. It requires Playwright with Chromium available. An existing installation can be supplied through `PLAYWRIGHT_MODULE`; `PLAYWRIGHT_CHANNEL=chrome` selects installed Chrome. Screenshots go to the system temporary directory, or `MOTION_REVIEW_DIR` if supplied.

## Configure contact and social profiles

The project form now uses a direct inquiry flow. Follow [INQUIRY-SETUP.md](INQUIRY-SETUP.md) to connect Formspree, configure validation and spam filtering, and verify delivery. In `dist/config.js`, `inquiryEndpoint` enables submission and `contactEmail` provides a direct-email fallback. Until the endpoint is configured, sending stays disabled. No live endpoint has been supplied yet. Never put private credentials in public configuration.

Use full HTTPS social profile URLs. Empty profiles remain Coming soon text.

## Files

- `dist/index.html`: homepage and dialogs.
- `dist/styles.css`, `agency.css`, `refinement.css`: shared, agency and latest visual styling.
- `dist/script.js`: navigation, project dialogs, services and motion controls.
- `dist/inquiry.js`: inquiry validation, submission, success and retry states.
- `scripts/test-inquiry.mjs`: local submission behavior tests with mocked responses.
- `scripts/create-policy-pages.mjs`: generates policy pages; run with modern Node.js after changing policy copy or the shared footer.
- `WEBSITE-HANDOFF.md`: functionality and remaining owner inputs.
- `NAMING-NOTES.md`: preliminary replacement-name research.

The generated campaign imagery is independent concept work, not client commissions or finished video ads. The website name is provisional.
