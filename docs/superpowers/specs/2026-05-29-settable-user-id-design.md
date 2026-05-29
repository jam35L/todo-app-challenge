# Settable User Id — Design

**Date:** 2026-05-29
**Status:** Approved design, implementation not started

## Goal

Provide a way to set the per-browser user id from the UI. Primary purpose is
**testing/demo convenience** — quickly switch between known ids to view different
lists during development or a demo. This is a dev/demo affordance, not a real
accounts feature.

## Background (current behavior)

- There is no authentication. Each browser holds an anonymous id in
  `localStorage['todo.userId']`, sent as the `X-User-Id` header on every request
  so the backend partitions lists per user.
- The id is owned entirely by `core/user-id.interceptor.ts`: `getOrCreateUserId()`
  reads `localStorage`, and lazily generates + persists a `crypto.randomUUID()` on
  first access. There is no service and no UI around it.
- The app is a single page (no router): `App` renders `<app-todo-list>` directly.

## Decisions

- **Placement:** an always-visible bar at the top of the page, above the TODO list.
- **Refresh on change:** full page reload (`location.reload()`). Simplest and
  safest for a dev affordance — the SPA reboots cleanly with the new id, no
  reactive wiring or partial-refresh edge cases.

## Architecture

Introduce a `UserIdService` as the single source of truth for the id, and a small
presentational `UserIdBar` rendered at app level above the list. The interceptor
stops touching `localStorage` directly and reads from the service.

### Units

1. **`UserIdService`** (`core/user-id.service.ts`) — owns the `'todo.userId'` key
   (moved out of the interceptor).
   - `userId(): string` — returns the stored id, generating + persisting a
     `crypto.randomUUID()` on first access (the current `getOrCreateUserId` logic).
   - `setUserId(id: string): void` — trims and writes to `localStorage`. Storage
     only, no reload side-effect, so it stays trivially unit-testable.

2. **`userIdInterceptor`** — same behavior, but now
   `inject(UserIdService).userId()` instead of its own localStorage helper. The
   `getOrCreateUserId` logic and `USER_ID_STORAGE_KEY` constant move into the service.

3. **`UserIdBar`** (`core/user-id-bar/`) — always-visible row rendered in
   `app.html` above `<app-todo-list>`. Shows the current id, an input prefilled
   with it, and an **Apply** button.
   - Apply is **disabled when the input is empty/whitespace** (the backend rejects
     a missing `X-User-Id`).
   - On Apply: `service.setUserId(trimmed)` then trigger a full page reload via an
     injected `Window`/`DOCUMENT` (so the reload is mockable in tests). The reboot
     re-fetches everything under the new id.

## Data flow

Apply → `setUserId` writes `localStorage` → reload → app boots → `TodoList` GETs
`/api/todos` → interceptor attaches the new id via the service. No reactive wiring.

## Error handling

The only real failure mode is an empty id, prevented by disabling Apply (trim
first). No format validation — any non-empty string is a valid partition key.

## Testing

- `UserIdService`: returns the stored id; creates + persists one when absent;
  `setUserId` persists the trimmed value.
- `userIdInterceptor` spec: update to assert the header is set from the service's id.
- `UserIdBar`: renders the current id; Apply disabled when empty; Apply calls
  `setUserId` + reload (spied), not the real `location.reload`.

## Out of scope (YAGNI)

Profiles / named lists, server-side validation changes, copy-to-clipboard, hiding
the control behind a flag or query param.
