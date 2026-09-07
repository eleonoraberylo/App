# Afterglow — digital emotion journal prototype

Current interface: an 23.08-second opening before typing unlocks. The entire sequence runs at 1.3× speed. Brighter stars and IBM Plex Mono lettering match the supplied check-in reference. A deep star field accelerates into fine radial streaks, then forms the prompt from seconds 13.85–21.54, holding it until 23.08 seconds. Keyboard, pointer, and reduced-motion paths all respect the 23.08-second gate. Reduced-motion visitors receive a static opening. No visible feeling list or instructional touch hint. Enter or the arrow automatically submits the entry for AI reflection; the adjacent notice explains the provider submission. Optional context can be submitted with Enter or its arrow; Shift+Enter adds a line. The separate Reflect with AI button is removed.

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
