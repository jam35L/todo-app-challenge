# TODO List App

A small full-stack TODO list: see your list, add items, and delete them. Built with the
latest **Angular** frontend and a latest **.NET Web API** backend. Data is held **in memory**
on the backend (no database) — it resets when the API restarts, by design for this exercise.

The full product/technical spec is in [`docs/PRD.md`](docs/PRD.md).

## Tech stack

| | |
|---|---|
| Frontend | Angular 21 (standalone components, signals, zoneless), Vitest tests |
| Backend  | ASP.NET Core Web API on **.NET 10**, xUnit tests |
| Data     | In-memory, thread-safe, partitioned per user |

## Repository layout

```
todo-app-challenge/
├─ README.md            # you are here
├─ docs/PRD.md          # product + technical design
├─ backend/             # .NET 10 solution (TodoApp.Api + TodoApp.Api.Tests)
└─ frontend/            # Angular 21 workspace
```

## Prerequisites

- **.NET SDK 10.0+** — the backend targets `net10.0`. Check with `dotnet --version` (must
  report `10.x`). Install from <https://dotnet.microsoft.com/download/dotnet/10.0>.
- **Node.js 20.19+ (or 22+)** and **npm**.

No other tooling is required beyond `dotnet restore` / `npm install`.

## Running the app

Run the backend first, then the frontend, in two terminals.

### 1. Backend — http://localhost:5080

```bash
cd backend
dotnet restore
dotnet run --project TodoApp.Api
```

The API serves under `http://localhost:5080/api/todos`. CORS is open to the Angular dev
server at `http://localhost:4200`.

### 2. Frontend — http://localhost:4200

```bash
cd frontend
npm install
npm start          # ng serve
```

Open <http://localhost:4200>. The frontend calls the API at `http://localhost:5080/api`;
to point it elsewhere, edit `frontend/src/environments/environment.ts`.

## Running the tests

**Backend** (unit + integration):

```bash
cd backend
dotnet test
```

**Frontend** (single run, no watch):

```bash
cd frontend
npm test -- --watch=false
```

Omit `-- --watch=false` to run the Vitest suite in watch mode during development.

## How it works (notes)

- **No authentication.** Each browser generates a random id once, stores it in
  `localStorage`, and sends it on every request as an `X-User-Id` header. The backend keeps
  a separate list per id, so two browsers see independent lists.
- **Validation** is enforced on the server (title required, max 200 chars; the optional
  description is also capped at 200 chars) and surfaced as RFC-7807
  `application/problem+json` responses; the UI mirrors these rules with inline validation
  messages and disables submitting an invalid title.
- **Architecture.** The backend is layered `Controller → ITodoService → ITodoRepository`,
  with an in-memory repository behind the interface — swappable for a database with no
  changes to the controller or service.

## API summary

| Method | Route | Body | Success | Errors |
|--------|-------|------|---------|--------|
| GET    | `/api/todos` | — | `200` `Todo[]` (newest first) | — |
| POST   | `/api/todos` | `{ "title": "...", "description": "..." }` (description optional) | `201` + `Todo`, `Location` header | `400` invalid title/description |
| DELETE | `/api/todos/{id}` | — | `204` | `404` unknown id |

All requests require an `X-User-Id` header (a missing header returns `400`).
