import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoForm, NewTodo } from './todo-form';

describe('TodoForm', () => {
  let fixture: ComponentFixture<TodoForm>;
  let saved: NewTodo[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TodoForm] });
    fixture = TestBed.createComponent(TodoForm);
    saved = [];
    fixture.componentInstance.save.subscribe((todo) => saved.push(todo));
    fixture.detectChanges();
  });

  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const description = () =>
    fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  const submitButton = () =>
    fixture.nativeElement.querySelector('.todo-form__submit') as HTMLButtonElement;

  function setValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function type(value: string) {
    setValue(input(), value);
  }

  function typeDescription(value: string) {
    setValue(description(), value);
  }

  function submit() {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function typeAndSubmit(value: string) {
    type(value);
    submit();
  }

  /** Marks a control touched (errors only show once touched), as a real blur would. */
  function blur(el: HTMLElement) {
    el.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  const errorText = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.todo-form__error'))
      .map((el) => (el as HTMLElement).textContent?.trim())
      .join(' ');

  it('emits the entered title with an empty description on submit', () => {
    typeAndSubmit('buy milk');
    expect(saved).toEqual([{ title: 'buy milk', description: '' }]);
  });

  it('emits the trimmed title and description', () => {
    type('  buy milk  ');
    typeDescription('  from the corner shop  ');
    submit();
    expect(saved).toEqual([{ title: 'buy milk', description: 'from the corner shop' }]);
  });

  it('does not emit for an empty title', () => {
    typeAndSubmit('');
    expect(saved).toEqual([]);
  });

  it('shows no validation error before the user interacts', () => {
    expect(fixture.nativeElement.querySelector('.todo-form__error')).toBeNull();
  });

  it('shows a required error when the title is left blank', () => {
    blur(input());
    expect(errorText()).toContain('Title is required.');
  });

  it('shows a max-length error when the title exceeds the limit', () => {
    type('a'.repeat(201));
    blur(input());
    expect(errorText()).toContain('Title must be 200 characters or fewer.');
  });

  it('shows a max-length error when the description exceeds the limit', () => {
    typeDescription('a'.repeat(201));
    blur(description());
    expect(errorText()).toContain('Description must be 200 characters or fewer.');
  });

  it('does not emit for a whitespace-only title', () => {
    typeAndSubmit('   ');
    expect(saved).toEqual([]);
  });

  it('does not clear the input on submit (the parent clears it on success)', () => {
    typeAndSubmit('buy milk');
    expect(input().value).toBe('buy milk');
  });

  it('reset() clears the input', () => {
    typeAndSubmit('buy milk');

    fixture.componentInstance.reset();
    fixture.detectChanges();

    expect(input().value).toBe('');
  });

  it('does not emit while disabled', () => {
    type('buy milk');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    submit();

    expect(saved).toEqual([]);
  });

  it('disables the submit button while disabled', () => {
    type('buy milk');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
  });

  it('pre-fills the fields from the value input', () => {
    fixture.componentRef.setInput('value', { title: 'existing', description: 'notes' });
    fixture.detectChanges();

    expect(input().value).toBe('existing');
    expect(description().value).toBe('notes');
  });

  it('uses the submitLabel for the submit button', () => {
    fixture.componentRef.setInput('submitLabel', 'Save');
    fixture.detectChanges();

    expect(submitButton().textContent?.trim()).toBe('Save');
  });

  it('emits cancel when the Cancel button is clicked', () => {
    let cancelled = false;
    fixture.componentInstance.cancel.subscribe(() => (cancelled = true));
    fixture.componentRef.setInput('showCancel', true);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.todo-form__cancel') as HTMLButtonElement).click();

    expect(cancelled).toBe(true);
  });
});
