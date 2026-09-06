# Afterglow — interface-first prototype

Vision: a quiet night-sky surface where naming an emotion leaves a colored trace. A short optional context note turns that check-in into a dated memory. The interaction is the product's core.

## Working now
- Responsive dark interface, colored mouse/touch trails, keyboard-accessible searchable emotion picker.
- Guided “I am feeling…” check-in and optional context.
- Memory collection with timestamps and confirmed deletion.
- Session-only by default; explicit opt-in device storage. No journal data is sent to a server. Local storage is not encrypted and is visible to other users of the same browser. Turning it off removes the stored copy.
- Reduced-motion support and animation pause.

## Deliberately not implemented
- Account registration, sign-in, password reset, cross-device sync, Google/Meta sign-in.
- AI guidance or health monitoring. The account button clearly describes this limitation and collects no credentials.

The name and copy are provisional. Emotion labels describe ordinary feelings. The palette is an expressive design choice, not a scientific mapping. Pink currently means affectionate. Delusion is not used as an emotion label. This prototype is not a diagnostic or treatment tool.

Research background: [Lieberman et al., 2007, Putting feelings into words](https://pubmed.ncbi.nlm.nih.gov/17576282/). This experiment does not validate this app or establish clinical effectiveness.

## Run
Serve `dist/` using any static HTTP server. There are no build dependencies. The interface uses external Google Fonts with system fallbacks. All scripts and styles are otherwise local. No analytics, AI requests, or journal-data transmission are implemented.

## Next implementation
Choose and configure a supported public authentication service, server-side per-user authorization, encrypted transport and appropriate storage protections, retention/deletion controls, and account recovery before accepting real sensitive entries in a multi-user product. AI guidance requires a separate API integration, explicit user consent, and a safety scope. Consumer chat subscriptions are not app API credentials.
