import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

/** Max title length — kept in sync with the backend validation rule. */
export const MAX_TITLE_LENGTH = 200;

/** Max description length — kept in sync with the backend validation rule. */
export const MAX_DESCRIPTION_LENGTH = 200;

/**
 * Rejects empty or whitespace-only values. Unlike `Validators.required`, which accepts
 * `"   "`, this checks the trimmed length so a blank title surfaces a visible error.
 */
function nonBlank(control: AbstractControl): ValidationErrors | null {
  return (control.value as string).trim().length === 0 ? { required: true } : null;
}

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
          [attr.aria-invalid]="titleControl.touched && titleControl.invalid"
          [attr.aria-describedby]="
            titleControl.touched && titleControl.invalid ? 'add-form-title-error' : null
          "
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
      @if (titleControl.touched && titleControl.invalid) {
        <p class="add-form__error" id="add-form-title-error" role="alert">
          @if (titleControl.hasError('required')) {
            Title is required.
          } @else if (titleControl.hasError('maxlength')) {
            Title must be {{ maxTitleLength }} characters or fewer.
          }
        </p>
      }
      <textarea
        formControlName="description"
        class="add-form__description"
        placeholder="Description (optional)"
        aria-label="New todo description"
        [attr.aria-invalid]="descriptionControl.touched && descriptionControl.invalid"
        [attr.aria-describedby]="
          descriptionControl.touched && descriptionControl.invalid
            ? 'add-form-description-error'
            : null
        "
        rows="2"
      ></textarea>
      @if (descriptionControl.touched && descriptionControl.hasError('maxlength')) {
        <p class="add-form__error" id="add-form-description-error" role="alert">
          Description must be {{ maxDescriptionLength }} characters or fewer.
        </p>
      }
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
    .add-form__error {
      margin: 0;
      font-size: 0.8rem;
      color: #b00020;
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
      validators: [nonBlank, Validators.maxLength(MAX_TITLE_LENGTH)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(MAX_DESCRIPTION_LENGTH)],
    }),
  });

  protected readonly titleControl = this.form.controls.title;
  protected readonly descriptionControl = this.form.controls.description;

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
