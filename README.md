# Afterglow — digital emotion journal prototype

Current interface: an 8-second star-flight opening. The full animation timeline runs at 1.875× the original 15-second timeline; timings below describe its unscaled choreography. Stars automatically accelerate and sweep toward the input text from 5.5–12.5 seconds. The converging particles stay muted gray and fade as much darker #555b58 smooth, antialiased text gradually appears in the exact input font and placeholder color, then crossfades into the actual placeholder over the final 2 seconds. There is no fully dotted or white intermediate wordmark. No pointer interaction is required. Its muted gray placeholder reads “Today I’m feeling”; there is no separate visible prompt, ellipsis, or bright solid lettering. IBM Plex Mono typography is preserved. Typing unlocks at 8 seconds, including the reduced-motion path. Enter or the arrow triggers the color animation and a local journal prompt. Optional context supports Enter to submit and Shift+Enter for a new line.

## Local check-in mechanics
Submitting with Enter or the arrow produces a six-second pulse through persistent horizontal pastel light bands and a prewritten, neutral reflection question. 40 supported everyday feeling labels each have a unique fixed pastel color, with common synonyms. Up to 7 recognized labels retain separate colors in the horizontal bands. Enter restarts a 6-second brightening and side-to-side sweep, and recognized labels appear unobtrusively below the entry. Unmatched text is explicitly left unclassified; it can still be saved. Clause-level simple negations are excluded, but this is keyword matching, not language understanding. Unmatched entries do not trigger a misleading emotion animation. Horizontal bands are the main scene from arrival onward. Stars are distributed within the same moving layers, with fine horizontal optical trails, soft bloom, and depth-dependent drift. Color transitions blend gradually after submission. Stars keep a subtle tint after the wave; reduced motion shows the tint without moving streaks. Another prompt cycles through four questions. These questions are not therapy or personalized interpretation.

The browser no longer calls /api/reflect. AI is deferred. The dormant server endpoint remains unconfigured for later development. No journal content is sent to an AI service in this flow. Existing saved memories remain readable.

## Storage and accounts
Existing device memories are preserved. Entries stay in the current session unless device storage is explicitly enabled. Device storage is unencrypted and accessible to other users of the same browser. Turning it off removes the stored copy. Account creation and cross-device storage remain unimplemented; the account panel says so.

## Development
Run node build.mjs, then node --test worker.test.mjs. No dependencies are required. The Worker includes the UI assets and exports fetch(request, env). Build output is ignored; authored UI assets remain under dist/. The standalone preview.html works without a server for journaling but cannot produce AI feedback.

The current deployment is owner-private. Before public launch, implement supported account registration, durable per-user rate limits and quotas, privacy and retention controls, and evaluate AI responses including crisis handling.

## References
- Co–Star: https://www.costarastrology.com/ — a user-supplied visual reference, not a source of copied assets.
- The user also referenced Julia Klodkina's Allians site. Its exact URL has not yet been identified.
- OpenAI Responses documentation: https://developers.openai.com/api/docs/guides/migrate-to-responses
- Prior concept precedents: Stellar (https://apps.apple.com/us/app/stellar-mood-journal-stars/id6776367622), Offlog (https://synaphi.github.io/offlog/), and Silk (https://weavesilk.com/). No uniqueness or legal-clearance claim is made.

## Sequential interaction
The opening reveals a text button. Clicking it opens the only feeling input. Enter fades that away into a clickable question; clicking the question opens the context editor in the same space. Enter then replaces the editor with a prewritten activity, chosen by recognized feeling words, with Save moment / Add more / New moment actions. Context is retained but not semantically interpreted. Activities draw on general grounding, kindness and values exercises in WHO’s Doing What Matters in Times of Stress, not a clinical assessment. Wave ribbons rise and fall with a six-second rhythmic submission pulse; stars follow the same curves. No check-in/status footer labels. Reduced motion follows the OS and can be changed in About.

## Instant interaction and independent strands
Stage changes and keyboard focus are synchronous: no timers, inert interval or animation gate after clicking text or submitting. Inputs appear at full opacity immediately. Questions and recommendations can brighten after receiving focus. Fourteen ambient strands move at different frequencies, with intermittent small positional buzzing independent of journal input. Only one strand, selected deterministically from the first recognized feeling’s color, receives a sharp traveling cardiogram displacement on submission. Other strands keep their own movement and color. Mixed-feeling input still uses the first recognized color for this single active-strand effect. Reduced-motion mode disables buzzing and submission displacement.

The selected strand now uses the supplied ECG reference shape: small lead-in, narrow upward R spike, deep downward S trough, and broad rounded T rise. A repeated trace scrolls horizontally for 4.8 seconds, fading back into ambient motion. This is a decorative animation, not a measured heartbeat; no reference-image assets are copied.

## Continuous rhythm
All strands now follow a continuous, smooth repeating downward/upward waveform from the first frame. Line brightness is constant; the submission effect changes positional vibration only, preserving the underlying phase and rhythm. The selected strand gains extra fine vibration for six seconds, then returns to its normal flow. Reduced motion freezes this movement.

## Angular sequential activation
Calm, nearly level strands now take turns producing a traveling piecewise-linear cardiogram: one strand per 1.55-second slot, with a quiet interval. Submission temporarily takes priority with a stronger 1.4-second impulse only on the selected emotion strand, followed by ambient sequencing. No synchronized broad sine waves or brightness flashing. Saturation and steady line visibility are increased; typography remains muted.


## Dream palette and patterns
Rose, blue, butter yellow and lilac strands have varied weights and localized angular buzz. 44 recognized labels. Follow-up questions and suggestions use prewritten feeling/topic rules, with no AI calls. How am I doing shows 7/30-day counts from existing session/device memories; it does not infer severity or diagnose. Optional Notifications API alerts run only after saving while the page is open, at most once per visit/day. Three tiredness/high-energy entries in 7 days trigger an invitation to reflect, not a medical threshold. Background push, cloud history and account sync remain unimplemented.
