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
      { id: '1', title: 'first', description: null, createdAtUtc: '2026-01-01T00:00:00Z' },
    ];
    let result: Todo[] | undefined;

    service.list().subscribe((r) => (result = r));

    const req = httpMock.expectOne(todosUrl);
    expect(req.request.method).toBe('GET');
    req.flush(todos);

    expect(result).toEqual(todos);
  });

  it('add() POSTs the title and description and returns the created item', () => {
    const created: Todo = {
      id: '2',
      title: 'buy milk',
      description: 'from the corner shop',
      createdAtUtc: '2026-01-01T00:00:00Z',
    };
    let result: Todo | undefined;

    service.add('buy milk', 'from the corner shop').subscribe((r) => (result = r));

    const req = httpMock.expectOne(todosUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'buy milk', description: 'from the corner shop' });
    req.flush(created);

    expect(result).toEqual(created);
  });

  it('add() omits the description from the body when it is blank', () => {
    service.add('buy milk', '').subscribe();

    const req = httpMock.expectOne(todosUrl);
    expect(req.request.body).toEqual({ title: 'buy milk' });
    req.flush({ id: '3', title: 'buy milk', description: null, createdAtUtc: '2026-01-01T00:00:00Z' });
  });

  it('update() PUTs the title and description to /todos/{id}', () => {
    const updated: Todo = {
      id: '2',
      title: 'new title',
      description: 'new notes',
      createdAtUtc: '2026-01-01T00:00:00Z',
    };
    let result: Todo | undefined;

    service.update('2', 'new title', 'new notes').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${todosUrl}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'new title', description: 'new notes' });
    req.flush(updated);

    expect(result).toEqual(updated);
  });

  it('update() omits the description from the body when it is blank (clears it)', () => {
    service.update('2', 'new title', '').subscribe();

    const req = httpMock.expectOne(`${todosUrl}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'new title' });
    req.flush({ id: '2', title: 'new title', description: null, createdAtUtc: '2026-01-01T00:00:00Z' });
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
