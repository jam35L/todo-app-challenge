import { TestBed } from '@angular/core/testing';

import { TodoItem } from './todo-item';
import { Todo } from '../todo.model';

describe('TodoItem', () => {
  const todo: Todo = {
    id: '1',
    title: 'buy milk',
    description: null,
    createdAtUtc: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TodoItem] });
  });

  function render(overrides: Partial<Todo> = {}) {
    const fixture = TestBed.createComponent(TodoItem);
    fixture.componentRef.setInput('todo', { ...todo, ...overrides });
    fixture.detectChanges();
    return fixture;
  }

  it('renders the todo title', () => {
    const el = render().nativeElement as HTMLElement;
    expect(el.textContent).toContain('buy milk');
  });

  it('renders the description when present', () => {
    const el = render({ description: 'from the corner shop' }).nativeElement as HTMLElement;
    const desc = el.querySelector('.todo-item__description');
    expect(desc?.textContent).toContain('from the corner shop');
  });

  it('does not render a description element when there is none', () => {
    const el = render({ description: null }).nativeElement as HTMLElement;
    expect(el.querySelector('.todo-item__description')).toBeNull();
  });

  it('renders the created time with seconds', () => {
    const time = (render().nativeElement as HTMLElement).querySelector('time');
    // h:mm:ss — the source timestamp has zero seconds, so any timezone shows :00
    expect(time!.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('emits delete with the todo id when the delete button is clicked', () => {
    const fixture = render();
    let emitted: string | undefined;
    fixture.componentInstance.delete.subscribe((id) => (emitted = id));

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button!.click();

    expect(emitted).toBe('1');
  });
});
