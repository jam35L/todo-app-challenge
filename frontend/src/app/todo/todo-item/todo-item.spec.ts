import { TestBed } from '@angular/core/testing';

import { TodoItem } from './todo-item';
import { Todo } from '../todo.model';

describe('TodoItem', () => {
  const todo: Todo = {
    id: '1',
    title: 'buy milk',
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TodoItem] });
  });

  function render() {
    const fixture = TestBed.createComponent(TodoItem);
    fixture.componentRef.setInput('todo', todo);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the todo title', () => {
    const el = render().nativeElement as HTMLElement;
    expect(el.textContent).toContain('buy milk');
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
