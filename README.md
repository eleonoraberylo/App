# Afterglow — digital emotion journal prototype

Current interface: a 15-second star-flight opening. Stars automatically accelerate and sweep toward the input text from 5.5–12.5 seconds. The converging particles stay muted gray and fade as smooth, antialiased text appears in the exact input font and placeholder color, then crossfades into the actual placeholder over the final 1.5 seconds. There is no fully dotted or white intermediate wordmark. No pointer interaction is required. Its muted gray placeholder reads “Today I’m feeling”; there is no separate visible prompt, ellipsis, or bright solid lettering. IBM Plex Mono typography is preserved. Typing unlocks at 15 seconds, including the reduced-motion path. Enter or the arrow automatically requests an AI response, with the provider disclosed beside the input. Optional context supports Enter to submit and Shift+Enter for a new line.

## AI connection
The server implements POST /api/reflect using OpenAI's Responses API. It requires a platform-authenticated visitor, same-origin POST, explicit consent, bounded input, and configured OPENAI_API_KEY and OPENAI_MODEL runtime variables. Secrets must be configured server-side in Sites; never commit them or put them in the browser. No provider key or model is currently configured, so the interface explicitly reports that AI is unavailable.

A generated reflection can suggest tentative feeling words and a small next step. “Not quite” lets the user provide a correction and request reconsideration. It never automatically assigns an emotion. The submission notice identifies AI; the response appears without a visible heading and and is saved only when the user saves the moment. No clinical effectiveness claims are made.

Requests set store:false. This disables response storage in the Responses API; it is not a claim of zero provider retention. The app does not log entry text or persist it on the server. Provider data handling must be reviewed before wider release. The request limiter is per isolate and is suitable only as a prototype safeguard, not a global quota.

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
