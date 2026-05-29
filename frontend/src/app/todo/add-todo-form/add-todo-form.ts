import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

/** Max title length — kept in sync with the backend validation rule. */
export const MAX_TITLE_LENGTH = 200;

/** Max description length — kept in sync with the backend validation rule. */
export const MAX_DESCRIPTION_LENGTH = 200;

/** What the form emits on a successful submit: a non-empty title and a trimmed description. */
export interface NewTodo {
  title: string;
  description: string;
}

/** Presentational: a typed reactive form that raises `add` with a trimmed, non-empty title. */
@Component({
  selector: 'app-add-todo-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="add-form" [formGroup]="form" (ngSubmit)="submit()">
      <div class="add-form__row">
        <input
          type="text"
          formControlName="title"
          class="add-form__input"
          placeholder="Add a task…"
          aria-label="New todo title"
          [maxlength]="maxTitleLength"
          autocomplete="off"
        />
        <button
          type="submit"
          class="add-form__submit"
          [disabled]="form.invalid || disabled()"
        >
          Add
        </button>
      </div>
      <textarea
        formControlName="description"
        class="add-form__description"
        placeholder="Description (optional)"
        aria-label="New todo description"
        [maxlength]="maxDescriptionLength"
        rows="2"
      ></textarea>
    </form>
  `,
  styles: `
    .add-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .add-form__row {
      display: flex;
      gap: 0.5rem;
    }
    .add-form__input {
      flex: 1 1 auto;
      padding: 0.5rem 0.65rem;
      border: 1px solid #cfcfcf;
      border-radius: 8px;
      font-size: 1rem;
    }
    .add-form__description {
      padding: 0.5rem 0.65rem;
      border: 1px solid #cfcfcf;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
    }
    .add-form__submit {
      flex: none;
      cursor: pointer;
    }
    .add-form__submit:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `,
})
export class AddTodoForm {
  readonly add = output<NewTodo>();

  /** When true (e.g. an add is in flight), the form will not submit. */
  readonly disabled = input(false);

  protected readonly maxTitleLength = MAX_TITLE_LENGTH;
  protected readonly maxDescriptionLength = MAX_DESCRIPTION_LENGTH;

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(MAX_TITLE_LENGTH)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(MAX_DESCRIPTION_LENGTH)],
    }),
  });

  protected submit(): void {
    const title = this.form.controls.title.value.trim();
    if (this.disabled() || this.form.invalid || title.length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    // Note: the form is NOT cleared here. The parent calls reset() only once the
    // add succeeds, so the user's text is preserved if the request fails.
    this.add.emit({ title, description: this.form.controls.description.value.trim() });
  }

  /** Clears the input. Called by the parent after a successful add. */
  reset(): void {
    this.form.reset();
  }
}
