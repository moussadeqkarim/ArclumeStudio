# Vorellia

An independent creative studio website for cinematic advertising, social media marketing, campaign direction, content production and websites. Photography-led editorial design, restrained motion, and responsive layouts. See [VORELLIA-DESIGN.md](VORELLIA-DESIGN.md) for the visual system and validation notes.

## Preview locally

No dependency installation or build is required. From this folder run:

```sh
python -m http.server 5173 --directory dist
```

Open http://localhost:5173.

## Visual reference images

The homepage and web-work page now use five clean static images based on the supplied footwear, skincare, jewelry, audio and enterprise references. Media overlays are removed. The pages identify these as visual references rather than commissioned client projects.

High-resolution PNG masters and the built-in imagegen prompt set are in design-assets/reference-masters/. Quality-94 JPEG delivery files, with 640px and 960px responsive variants, are in dist/assets/references/. The generated sources range from 1498 to 1672 pixels wide. Reconstruction creates new fine detail rather than recovering original source pixels.

Neither page loads the 3D renderer, GSAP, video previews or playback controls. Images preserve their complete compositions and declared dimensions; lower-page images load lazily. Calendly scheduling, service and mobile navigation interactions remain available. The client-work page retains the actual Sokoune collection.

## Configure contact and social profiles

The website uses a Calendly-only booking flow. Follow [INQUIRY-SETUP.md](INQUIRY-SETUP.md) to verify the event URL, availability and embedded/fallback booking paths. Public settings live in `dist/config.js`; never put private credentials in that file.

The footer currently links only to the supplied Instagram profile. Add another social profile only when its exact HTTPS URL is confirmed.

## Files

- `dist/index.html`: homepage and dialogs.
- `dist/styles.css`, `agency.css`, `refinement.css`: shared, agency and latest visual styling.
- `dist/script.js`: navigation, project dialogs, services, social links, motion controls and lazy Calendly scheduling.
- `scripts/create-policy-pages.mjs`: generates policy pages; run with modern Node.js after changing policy copy or the shared footer.
- `WEBSITE-HANDOFF.md`: functionality and remaining owner inputs.
- `NAMING-NOTES.md`: preliminary replacement-name research.

The generated campaign imagery is independent concept work, not client commissions or finished video ads. The website name is provisional.
