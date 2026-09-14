# Arclume Studio — working name

An independent creative agency website for cinematic advertising, social media marketing, campaign direction and content production. Black, white and yellow with restrained motion and a continuous vertical services reel.

## Preview locally

No dependency installation or build is required. From this folder run:

```sh
python -m http.server 5173 --directory dist
```

Open http://localhost:5173.

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
