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

  function render(inputs: { todo?: Partial<Todo>; editing?: boolean; saving?: boolean } = {}) {
    const fixture = TestBed.createComponent(TodoItem);
    fixture.componentRef.setInput('todo', { ...todo, ...inputs.todo });
    if (inputs.editing !== undefined) fixture.componentRef.setInput('editing', inputs.editing);
    if (inputs.saving !== undefined) fixture.componentRef.setInput('saving', inputs.saving);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the todo title', () => {
    const el = render().nativeElement as HTMLElement;
    expect(el.textContent).toContain('buy milk');
  });

  it('renders the description when present', () => {
    const el = render({ todo: { description: 'from the corner shop' } })
      .nativeElement as HTMLElement;
    const desc = el.querySelector('.todo-item__description');
    expect(desc?.textContent).toContain('from the corner shop');
  });

  it('does not render a description element when there is none', () => {
    const el = render({ todo: { description: null } }).nativeElement as HTMLElement;
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

    const button = (fixture.nativeElement as HTMLElement).querySelector('.todo-item__delete');
    (button as HTMLButtonElement).click();

    expect(emitted).toBe('1');
  });

  it('emits startEdit when the edit button is clicked', () => {
    const fixture = render();
    let started = false;
    fixture.componentInstance.startEdit.subscribe(() => (started = true));

    const edit = (fixture.nativeElement as HTMLElement).querySelector('.todo-item__edit');
    (edit as HTMLButtonElement).click();

    expect(started).toBe(true);
  });

  it('shows the edit form pre-filled when editing', () => {
    const el = render({ todo: { title: 'buy milk', description: 'notes' }, editing: true })
      .nativeElement as HTMLElement;

    expect(el.querySelector('app-todo-form')).not.toBeNull();
    expect((el.querySelector('input') as HTMLInputElement).value).toBe('buy milk');
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('notes');
    // The read-only view is replaced by the form.
    expect(el.querySelector('.todo-item__delete')).toBeNull();
  });

  it('re-emits save with the edited values', () => {
    const fixture = render({ editing: true });
    let saved: { title: string; description: string } | undefined;
    fixture.componentInstance.save.subscribe((v) => (saved = v));

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'updated';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

    expect(saved).toEqual({ title: 'updated', description: '' });
  });

  it('emits cancelEdit when the form is cancelled', () => {
    const fixture = render({ editing: true });
    let cancelled = false;
    fixture.componentInstance.cancelEdit.subscribe(() => (cancelled = true));

    const cancel = (fixture.nativeElement as HTMLElement).querySelector('.todo-form__cancel');
    (cancel as HTMLButtonElement).click();

    expect(cancelled).toBe(true);
  });

  it('disables the edit form submit while saving', () => {
    const el = render({ editing: true, saving: true }).nativeElement as HTMLElement;
    const submit = el.querySelector('.todo-form__submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });
});
