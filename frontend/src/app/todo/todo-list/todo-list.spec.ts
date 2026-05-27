import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TodoList } from './todo-list';
import { Todo } from '../todo.model';
import { environment } from '../../../environments/environment';

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let httpMock: HttpTestingController;
  const todosUrl = `${environment.apiBaseUrl}/todos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(TodoList);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const submitButton = () =>
    fixture.nativeElement.querySelector('.add-form__submit') as HTMLButtonElement;

  /** Runs ngOnInit (which triggers the initial load) and flushes the response. */
  function init(todos: Todo[]) {
    fixture.detectChanges();
    httpMock.expectOne(todosUrl).flush(todos);
    fixture.detectChanges();
  }

  function submitNewTitle(value: string) {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('loads and renders todos on init', () => {
    init([
      { id: '1', title: 'first task', createdAt: '2026-01-01T00:00:00Z' },
      { id: '2', title: 'second task', createdAt: '2026-01-02T00:00:00Z' },
    ]);

    expect(text()).toContain('first task');
    expect(text()).toContain('second task');
  });

  it('shows an empty-state message when there are no todos', () => {
    init([]);
    expect(text()).toContain('Nothing to do yet');
  });

  it('adds a todo via the form and renders it', () => {
    init([]);

    submitNewTitle('new task');

    const req = httpMock.expectOne(todosUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'new task' });
    req.flush({ id: '9', title: 'new task', createdAt: '2026-01-03T00:00:00Z' });
    fixture.detectChanges();

    expect(text()).toContain('new task');
  });

  it('clears the form after a successful add', () => {
    init([]);

    submitNewTitle('new task');
    httpMock
      .expectOne(todosUrl)
      .flush({ id: '9', title: 'new task', createdAt: '2026-01-03T00:00:00Z' });
    fixture.detectChanges();

    expect(input().value).toBe('');
  });

  it('keeps the typed text and shows an error when the add fails', () => {
    init([]);

    submitNewTitle('new task');
    httpMock
      .expectOne(todosUrl)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(input().value).toBe('new task');
    expect(text()).toContain('Could not add');
  });

  it('disables the add button while the add is in flight', () => {
    init([]);

    submitNewTitle('new task');

    // Request is pending (not yet flushed) — the button should be disabled.
    expect(submitButton().disabled).toBe(true);

    httpMock
      .expectOne(todosUrl)
      .flush({ id: '9', title: 'new task', createdAt: '2026-01-03T00:00:00Z' });
  });

  it('deletes a todo when its delete button is clicked', () => {
    init([{ id: '1', title: 'doomed task', createdAt: '2026-01-01T00:00:00Z' }]);

    const deleteButton = fixture.nativeElement.querySelector(
      '.todo-item__delete',
    ) as HTMLButtonElement;
    deleteButton.click();

    const req = httpMock.expectOne(`${todosUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    fixture.detectChanges();

    expect(text()).not.toContain('doomed task');
  });

  it('shows an error message when loading fails', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(todosUrl)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(text()).toContain('Could not load');
  });
});
