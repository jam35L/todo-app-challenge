import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TodoService } from './todo.service';
import { Todo } from './todo.model';
import { environment } from '../../environments/environment';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  const todosUrl = `${environment.apiBaseUrl}/todos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('list() issues a GET to /todos and returns the items', () => {
    const todos: Todo[] = [
      { id: '1', title: 'first', createdAt: '2026-01-01T00:00:00Z' },
    ];
    let result: Todo[] | undefined;

    service.list().subscribe((r) => (result = r));

    const req = httpMock.expectOne(todosUrl);
    expect(req.request.method).toBe('GET');
    req.flush(todos);

    expect(result).toEqual(todos);
  });

  it('add() POSTs the title and returns the created item', () => {
    const created: Todo = {
      id: '2',
      title: 'buy milk',
      createdAt: '2026-01-01T00:00:00Z',
    };
    let result: Todo | undefined;

    service.add('buy milk').subscribe((r) => (result = r));

    const req = httpMock.expectOne(todosUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'buy milk' });
    req.flush(created);

    expect(result).toEqual(created);
  });

  it('remove() issues a DELETE to /todos/{id}', () => {
    let completed = false;

    service.remove('2').subscribe(() => (completed = true));

    const req = httpMock.expectOne(`${todosUrl}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
