# PRD — Simple TODO List App

**Status:** Approved for implementation
**Date:** 2026-05-27
**Author:** James Lo

---

## 1. Overview

A minimal TODO list application built as a coding exercise. A user can **see** their
TODO list, **add** items to it, and **delete** items from it. The frontend is built
with the latest stable **Angular**; the backend is the latest stable **.NET Web API**.
Data lives **in memory** on the backend — no database.

The point of the exercise is not the feature set (which is intentionally tiny) but the
**quality** of the code, tests, and architecture around it.

## 2. Goals & Non-Goals

### Goals
- Deliver a working, runnable full-stack app that lists, adds, and deletes TODO items.
- Demonstrate clean architecture, sensible separation of concerns, and good test coverage.
- Keep the solution proportionate — small app, small footprint, no over-engineering.
- Ship a repository that a reviewer can clone and run with `npm install` + NuGet restore,
  plus anything extra documented in a README.

### Non-Goals (out of scope for v1)
- Persistent storage / database (explicitly in-memory).
- Authentication / authorization (no login).
- Editing an item's text after creation.
- Marking items complete — **deferred**, but the design must accommodate it (see §10).
- Deployment, hosting, CI/CD pipelines, containerization.

## 3. Users

A single end user managing their own list. There is **no authentication**, but lists are
**partitioned per user**: the client generates a stable user id once and stores it
(`localStorage`), sending it on every request via an `X-User-Id` header. The backend keys
its in-memory store by that id. This keeps the contract realistic (a server that serves
many users) while staying within the no-database, no-auth scope.

## 4. Functional Requirements

| # | Requirement | Acceptance criteria |
|---|-------------|---------------------|
| F1 | See the TODO list | Loading the app fetches and displays all of the user's items, newest first. An empty list shows a friendly empty state. |
| F2 | Add an item | Submitting a non-empty title adds the item and it appears in the list without a full reload. |
| F3 | Delete an item | Deleting an item removes it from the list and the server. |
| F4 | Per-user isolation | Two different user ids see two independent lists. |
| F5 | Input validation | Empty/whitespace-only titles are rejected; titles are capped (200 chars). The UI prevents submission and the API enforces it independently. |

## 5. Non-Functional Requirements

- **Architecture:** clear layering with dependency inversion at the persistence seam.
- **Code quality:** idiomatic, readable, consistently formatted; linting on the frontend,
  analyzers/nullable-enabled on the backend.
- **Testing:** unit tests for business logic and integration tests for the HTTP surface on
  the backend; service and component tests on the frontend.
- **Reliability:** thread-safe in-memory store (concurrent requests must not corrupt state).
- **Errors:** the API returns structured, meaningful error responses; the UI never silently
  swallows a failure — it surfaces loading and error states to the user.
- **Documentation:** a root `README.md` covers prerequisites, install, run, and test.

## 6. System Architecture

```
┌─────────────────────────┐         HTTP / JSON          ┌──────────────────────────────┐
│   Angular SPA            │   GET/POST/DELETE /api/todos │   .NET Web API                 │
│                          │   header: X-User-Id          │                                │
│  TodoListComponent       │ ───────────────────────────▶ │  TodosController (thin)        │
│   ├─ AddTodoForm         │                              │        │                       │
│   └─ TodoItem            │ ◀─────────────────────────── │        ▼                       │
│  TodoService (HttpClient)│         JSON / ProblemDetails│  ITodoService → TodoService    │
│  userIdInterceptor       │                              │        │                       │
│  signals for state       │                              │        ▼                       │
└─────────────────────────┘                              │  ITodoRepository               │
                                                          │   └─ InMemoryTodoRepository    │
                                                          │      (ConcurrentDictionary)    │
                                                          └──────────────────────────────┘
```

### 6.1 Backend (.NET Web API)

Layered, controller-based Web API:

- **`TodosController`** — thin HTTP layer. Maps requests/responses, no business logic.
- **`ITodoService` / `TodoService`** — business logic: validation, ordering, orchestration.
- **`ITodoRepository` / `InMemoryTodoRepository`** — persistence seam. The in-memory
  implementation uses a thread-safe structure keyed by user id
  (`ConcurrentDictionary<string, ...>`). Swapping in a real database later means writing one
  new class — no changes to the service or controller.
- **DTOs** — `CreateTodoRequest { title }` in; `TodoResponse { id, title, createdAt }` out.
  Domain model is never leaked directly to the wire.
- **Cross-cutting:** `nullable` enabled, dependency injection via the built-in container,
  RFC-7807 `ProblemDetails` for errors, a global exception handler, and CORS configured to
  allow the Angular dev-server origin.

### 6.2 Frontend (Angular, latest stable)

- **Standalone components** (no NgModules), modern `@if`/`@for` control flow.
- **`TodoListComponent`** (smart) owns state via **signals** and composes two presentational
  children: **`AddTodoFormComponent`** (typed reactive form) and **`TodoItemComponent`**.
- **`TodoService`** wraps `HttpClient` for `list()`, `add(title)`, `remove(id)`.
- **`userIdInterceptor`** — an `HttpInterceptorFn` that reads/creates the user id in
  `localStorage` and attaches the `X-User-Id` header to every request.
- **State & UX:** loading and error signals drive spinner / error-banner / empty-state UI.
  The API base URL comes from Angular environment files.

## 7. API Contract

Base path: `/api/todos`. All responses are JSON; errors use `application/problem+json`.

| Method | Route | Request body | Success | Error responses |
|--------|-------|--------------|---------|-----------------|
| `GET` | `/api/todos` | — | `200` `TodoResponse[]` (newest first) | — |
| `POST` | `/api/todos` | `{ "title": "buy milk" }` | `201` + `TodoResponse`, `Location` header | `400` title empty/whitespace/too long |
| `DELETE` | `/api/todos/{id}` | — | `204` | `404` id not found for this user |

**Models**
```jsonc
// TodoResponse
{ "id": "a1b2c3d4-...", "title": "buy milk", "createdAt": "2026-05-27T10:15:00Z" }
// CreateTodoRequest
{ "title": "buy milk" }
```
*Reserved for v2 (see §10):* `PATCH /api/todos/{id}` with `{ "isComplete": true }`.

## 8. Testing Strategy

**Backend (xUnit):**
- *Unit* — `TodoService`: validation rules (empty/too-long title → error), correct ordering,
  delegation to the repository; `InMemoryTodoRepository`: add/list/delete and per-user
  isolation, including a basic concurrency check.
- *Integration* — `WebApplicationFactory` exercising the real HTTP pipeline: each endpoint's
  happy path plus the 400/404 cases and the `X-User-Id` partitioning.

**Frontend (Jasmine/Karma — Angular CLI default):**
- `TodoService` against `HttpTestingController`: correct verbs/URLs/headers and response mapping.
- Component tests: rendering of list/empty/error states, add-form validation, and that
  add/delete actions invoke the service.

## 9. Repository Layout & Running

```
todo-app-challege/
├─ README.md            # prerequisites, install, run, test  (the canonical run guide)
├─ docs/PRD.md          # this document
├─ backend/             # .NET Web API solution (+ test project)
└─ frontend/            # Angular workspace
```

**Run target (documented fully in README):**
- Backend: restore NuGet packages, `dotnet run` → API on its localhost port.
- Frontend: `npm install`, `ng serve` → app on `http://localhost:4200`, talking to the API.
- Any extra step (SDK version, setting the API URL, CORS origin) goes in the README, per the brief.

**Toolchain prerequisites (implementation note):** the brief requires the *latest* stable
Angular and .NET. Use whatever `ng new` installs for Angular. For .NET, target the latest
stable SDK (.NET 9+, .NET 10 LTS recommended); the current dev machine has SDK 8.0.413, so
installing a newer SDK is an implementation prerequisite to be captured in the README.

## 10. Future Enhancements (designed-for, not built)

- **Completion toggle** — the highest-priority next step. Accommodated already: add an
  `isComplete` boolean to the domain model and `TodoResponse`, and a `PATCH /api/todos/{id}`
  endpoint; no architectural change needed.
- **Persistent storage** — replace `InMemoryTodoRepository` with an EF Core / DB-backed
  implementation behind the existing `ITodoRepository`.
- **Authentication** — promote the ad-hoc `X-User-Id` to a real authenticated identity.
- **Edit item text.**

## 11. Acceptance Criteria (Definition of Done)

1. F1–F5 demonstrably work end-to-end in a browser.
2. Backend and frontend test suites exist and pass.
3. The persistence seam (`ITodoRepository`) is intact — store is swappable without touching
   the service or controller.
4. `README.md` lets a fresh reviewer install, run, and test with only the documented steps.
5. The repository is pushable and shareable as a single git repo link.
