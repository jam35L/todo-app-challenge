import { HttpInterceptorFn } from '@angular/common/http';

/** localStorage key under which the anonymous per-browser user id is kept. */
export const USER_ID_STORAGE_KEY = 'todo.userId';

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Attaches a stable, per-browser X-User-Id header to every request so the backend
 * can partition TODO lists per user. There is no authentication — the id is just an
 * anonymous identifier generated once and persisted in localStorage.
 */
export const userIdInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'X-User-Id': getOrCreateUserId() } }));
