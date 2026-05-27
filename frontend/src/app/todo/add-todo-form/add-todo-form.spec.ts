import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTodoForm } from './add-todo-form';

describe('AddTodoForm', () => {
  let fixture: ComponentFixture<AddTodoForm>;
  let emitted: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AddTodoForm] });
    fixture = TestBed.createComponent(AddTodoForm);
    emitted = [];
    fixture.componentInstance.add.subscribe((title) => emitted.push(title));
    fixture.detectChanges();
  });

  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const submitButton = () =>
    fixture.nativeElement.querySelector('.add-form__submit') as HTMLButtonElement;

  function type(value: string) {
    const el = input();
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
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

  it('emits the entered title on submit', () => {
    typeAndSubmit('buy milk');
    expect(emitted).toEqual(['buy milk']);
  });

  it('trims surrounding whitespace before emitting', () => {
    typeAndSubmit('  buy milk  ');
    expect(emitted).toEqual(['buy milk']);
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
