import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTodoForm, NewTodo } from './add-todo-form';

describe('AddTodoForm', () => {
  let fixture: ComponentFixture<AddTodoForm>;
  let emitted: NewTodo[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AddTodoForm] });
    fixture = TestBed.createComponent(AddTodoForm);
    emitted = [];
    fixture.componentInstance.add.subscribe((todo) => emitted.push(todo));
    fixture.detectChanges();
  });

  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const description = () =>
    fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  const submitButton = () =>
    fixture.nativeElement.querySelector('.add-form__submit') as HTMLButtonElement;

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

  it('emits the entered title with an empty description on submit', () => {
    typeAndSubmit('buy milk');
    expect(emitted).toEqual([{ title: 'buy milk', description: '' }]);
  });

  it('emits the trimmed title and description', () => {
    type('  buy milk  ');
    typeDescription('  from the corner shop  ');
    submit();
    expect(emitted).toEqual([{ title: 'buy milk', description: 'from the corner shop' }]);
  });

  it('does not emit for an empty title', () => {
    typeAndSubmit('');
    expect(emitted).toEqual([]);
  });

  it('does not emit for a whitespace-only title', () => {
    typeAndSubmit('   ');
    expect(emitted).toEqual([]);
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

    expect(emitted).toEqual([]);
  });

  it('disables the submit button while disabled', () => {
    type('buy milk');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
  });
});
