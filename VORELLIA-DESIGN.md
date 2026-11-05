# Vorellia editorial direction

Vorellia is an independent creative studio for immersive websites, cinematic advertising and brand campaigns. Lead with an understandable offer and evidence of the work, with one restrained signature effect.

## Visual system

- Paper #fafaf9, ink #20211f, secondary text #62645f, surface #f0f1ee, border #deded9, yellow #e8d35e, lavender #e9e2f1.
- Keep the established Helvetica Neue / Helvetica / Arial family. Fluid display type, looser mobile tracking, 16px mobile descriptions, 17–19px main desktop copy, 12–14px supporting information.
- Large project imagery alternates with compact explanatory sections. Copy occupies reserved layout space, never an overlay across a product.
- editorial.css scopes homepage refinements to .portfolio-home; the client project context uses explicit shared selectors. Existing companion-page layouts remain intact.

## Homepage structure

1. Studio offer, glass-ribbon signature, View selected work and Start a project.
2. Selected Sokoune campaign, with contextual description, three frames and a scope summary.
3. Footwear website, clearly identified as a self-initiated concept, with a direct link to the project. The abstract work-preview renderer is removed from the homepage.
4. Studio approach, services, process, FAQ and project inquiry.

Sokoune's client-work page adds a brief description of the visual direction and collection. No invented performance results or client testimonials are used. Existing supplied imagery is reused. sokoune-detail.jpg is a quality-94 delivery encoding of the supplied 10.png; its original is retained. New creative imagery remains a separate review decision.

## Motion and performance

- The existing sculptural ribbon retains its 14-second loop, playback control, subtle cursor response and static poster. Offscreen/background rendering remains stopped.
- The homepage imports the hero renderer directly, avoiding the unrelated RoomEnvironment/work renderer. The legacy homepage scroll script is no longer loaded.
- Hero scroll reads are batched into animation frames; existing interpolation smooths the result without allocating a tween for every scroll event.
- One desktop campaign timeline uses the self-hosted, matching GSAP ScrollTrigger 3.15.0 plugin. It loads near the story, expands the composition and reveals two supporting frames over 0.85 viewport of scroll. There is no scroll hijacking or snap.
- Pinning runs only at widths of at least 1100px, heights of at least 700px and with no reduced-motion preference. A visible control can disable it. Mobile, reduced motion, failed script loading and no JavaScript retain the complete static composition.
- New lower-page images load lazily and reserve their layout dimensions. No new videos, fonts, framework or remote runtime dependencies are introduced. The buildless dist/ deployment stays compatible with Cloudflare Workers.

## Validation

- node scripts/test-editorial.mjs: reduced-motion/mobile behavior, playback preference, stale asynchronous activation, rapid toggles, failed plugin loading and responsive cleanup.
- node scripts/test-inquiry.mjs: six mocked submission tests. The harness includes text-node/SVG creation used by the existing submit button; no live inquiry is sent.
- Syntax checks for editorial.js, motion-studio.js, hero-ribbon.js and test-motion-browser.cjs.
- Browser review uses the supported computer-use browser. Inspect hero, three campaign frames, pin transitions, motion toggle, service accordion, service preselection, mobile menu and inquiry dialog at narrow/mobile/laptop/desktop sizes.
- scripts/test-motion-browser.cjs also reflects the current homepage for future Playwright regression runs; it requires a configured local Playwright installation.

The legacy ARCLUME_CONFIG key is retained to preserve inquiry and booking integrations. No deployment configuration or credentials are changed.

## Static reference replacement

The homepage ribbon, motion studies and Sokoune showcase were replaced by the five supplied visual directions in images 5–9. The linked web-work page uses the same five assets. Client work remains separately identified on its own page.

The built-in imagegen tool reconstructed the small screenshots, removed media UI and refined detail. This is not a lossless restoration. Full prompts and PNG masters are in design-assets/reference-masters/. Runtime JPEG sources have responsive 640px/960px variants and no cropping transforms. Neither replacement page loads the Three.js/GSAP motion entry points, video previews, autoplay or play/pause controls. The old renderer files are retained for project history and are not requested by these pages.

Use reference-gallery.css for the new composition. It preserves image proportions, uses a two-column desktop gallery and a single mobile column, and labels the images as visual references rather than client commissions.
