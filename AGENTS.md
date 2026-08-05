# FlipOn Mobile — Agent Guide

## Expo

Expo HAS CHANGED. Before writing Expo/React Native code, read the versioned docs for this project:
https://docs.expo.dev/versions/v54.0.0/

Prefer Expo SDK APIs and documented patterns over outdated Stack Overflow snippets.

## Product context

FlipOn helps people decide an activity quickly (duo or group):
private votes → shared result → optional Boost plan.

- Session creation is step-by-step: type + cadre first, then invitation lobby.
- Groupe lets the host pick party size (3–8). Voting starts when the lobby is full.
- Active sessions + history are persisted locally; duo create/join/vote go through FlipOn API (`/api/duo`).
- Google via Clerk on Profil (optional for joining by code).

Navigation:
- Tabs: Accueil, Historique, Profil
- FAB `+`: create Session
- Flow screens (not tabs): Session → Vote → Result → Boost

UI copy is French with correct accents and apostrophes.
Do not invent auto-booking/reservation by FlipOn.
Do not add marketing-heavy or redundant screens without need.

## Mobile UX / engineering practices

- Poll only while the screen is focused and the app is active (`AppState`); never leave intervals running in background
- Guard async UI updates after unmount / navigation (`useMounted`)
- Debounce / disable double-taps on primary actions (vote, create, join, launch)
- Prefer `useFocusEffect` to refresh Accueil / Historique when the tab becomes visible
- Keyboard: `keyboardShouldPersistTaps="handled"`; avoid covering inputs with the tab bar / FAB
- Touch targets ≥ 44pt; set `accessibilityRole` / `accessibilityLabel` on icon-only and primary CTAs
- Validate and sanitize user input (session codes) on the client before network calls
- HTTPS only for API (except local `localhost` during dev)
- Persist session/history with AsyncStorage; tokens with SecureStore (Clerk) — never log secrets or votes
- Haptics for decisive actions (Oui / Passer) when available; keep motion subtle
- Loading / empty / error states for every network-facing screen

## Engineering best practices

- Keep changes small and scoped to the request
- Prefer clear names, short functions, typed TypeScript
- Reuse shared tokens/components (`constants/flipon.ts`) before duplicating styles
- One responsibility per screen/module
- Avoid speculative abstractions and unused code
- Handle loading, empty, and error states for user-facing flows
- Validate inputs on the client; never trust client-only checks for security

## Security (OWASP-minded)

Apply these by default when adding features:

1. **Secrets** — never commit API keys, tokens, passwords, or private credentials. Use `.env` locally and EAS Secrets in prod. Keep `.env` gitignored; only `.env.example` without secrets.
2. **AuthN/AuthZ** — authenticate users; authorize every sensitive action server-side (session membership, vote access, result access).
3. **Injection** — parameterize queries/API payloads; sanitize any user-controlled strings rendered or stored.
4. **Sensitive data** — minimize PII; mask phone/email where shown; votes stay private; no sensitive data in logs or analytics.
5. **Session/invitation codes** — unguessable, time-limited, single-purpose; expire sessions automatically.
6. **Transport** — HTTPS only; no cleartext secrets in URLs or deep links.
7. **Access control** — results/history only for session members; Boost gated by subscription checks on backend.
8. **Permissions** — request location/notifications only when needed, with clear purpose.
9. **Dependencies** — prefer maintained Expo-compatible packages; avoid abandoned libs.
10. **Dangerous actions** — confirm destructive flows (logout all devices, delete account).
11. **XSS / Web** — careful with `WebView`, HTML, and deep links if introduced.
12. **Broken access / IDOR** — never authorize by client-provided userId alone; verify ownership/membership server-side.

If a feature needs backend rules, say so explicitly and do not fake security only in the UI.

## Long-term maintainability

- Stable folder structure: screens in `app/`, shared UI/helpers outside routes
- Avoid duplicate screens (tabs vs root copies); one source of truth
- Prefer pure, testable business logic outside UI components when logic grows
- Document public env vars in `.env.example`
- Keep README product-focused; put agent/dev rules in `AGENTS.md`
- Design for change: Basique vs Boost as capability flags, not copy-paste flows
- No dead code, commented-out blocks, or temporary hacks left behind
- When unsure, choose the simpler option that is easier to delete or extend later

## Definition of done (for AI changes)

- Feature works for the happy path and obvious edge cases
- French accents/apostrophes correct in user-facing text
- No secrets introduced
- No unnecessary new dependencies
- Security implications considered (authz, privacy, expiry)
- Code remains readable for a future maintainer
