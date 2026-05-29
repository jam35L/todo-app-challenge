import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Todo } from './todo.model';

/** Talks to the backend TODO API. The X-User-Id header is added by the interceptor. */
@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly todosUrl = `${environment.apiBaseUrl}/todos`;

  list(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.todosUrl);
  }

  add(title: string, description: string): Observable<Todo> {
    return this.http.post<Todo>(this.todosUrl, this.body(title, description));
  }

  update(id: string, title: string, description: string): Observable<Todo> {
    return this.http.put<Todo>(`${this.todosUrl}/${id}`, this.body(title, description));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.todosUrl}/${id}`);
  }

  /** Omit the optional description entirely when blank, matching the documented contract. */
  private body(title: string, description: string): { title: string; description?: string } {
    return description ? { title, description } : { title };
  }
}
