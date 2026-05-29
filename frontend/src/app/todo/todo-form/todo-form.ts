import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
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

/** The trimmed title (non-empty) and description the form emits on a successful submit. */
export interface NewTodo {
  title: string;
  description: string;
}

/**
 * Presentational: a typed reactive form for a todo's title + optional description.
 * Used both for adding (empty) and inline editing (pre-filled via `value`). Emits `save`
 * with trimmed values; the parent decides what to do (create vs update) and when to reset.
 */
@Component({
  selector: 'app-todo-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="todo-form" [formGroup]="form" (ngSubmit)="submit()">
      <div class="todo-form__row">
        <input
          type="text"
          formControlName="title"
          class="todo-form__input"
          placeholder="Add a task…"
          aria-label="Todo title"
          [attr.aria-invalid]="titleControl.touched && titleControl.invalid"
          [attr.aria-describedby]="
            titleControl.touched && titleControl.invalid ? 'todo-form-title-error' : null
          "
          autocomplete="off"
        />
        <button type="submit" class="todo-form__submit" [disabled]="form.invalid || disabled()">
          {{ submitLabel() }}
        </button>
        @if (showCancel()) {
          <button type="button" class="todo-form__cancel" (click)="cancel.emit()">Cancel</button>
        }
      </div>
      @if (titleControl.touched && titleControl.invalid) {
        <p class="todo-form__error" id="todo-form-title-error" role="alert">
          @if (titleControl.hasError('required')) {
            Title is required.
          } @else if (titleControl.hasError('maxlength')) {
            Title must be {{ maxTitleLength }} characters or fewer.
          }
        </p>
      }
      <textarea
        formControlName="description"
        class="todo-form__description"
        placeholder="Description (optional)"
        aria-label="Todo description"
        [attr.aria-invalid]="descriptionControl.touched && descriptionControl.invalid"
        [attr.aria-describedby]="
          descriptionControl.touched && descriptionControl.invalid
            ? 'todo-form-description-error'
            : null
        "
        rows="2"
      ></textarea>
      @if (descriptionControl.touched && descriptionControl.hasError('maxlength')) {
        <p class="todo-form__error" id="todo-form-description-error" role="alert">
          Description must be {{ maxDescriptionLength }} characters or fewer.
        </p>
      }
    </form>
  `,
  styles: `
    .todo-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .todo-form__row {
      display: flex;
      gap: 0.5rem;
    }
    .todo-form__input {
      flex: 1 1 auto;
      padding: 0.5rem 0.65rem;
      border: 1px solid #cfcfcf;
      border-radius: 8px;
      font-size: 1rem;
    }
    .todo-form__description {
      padding: 0.5rem 0.65rem;
      border: 1px solid #cfcfcf;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
    }
    .todo-form__error {
      margin: 0;
      font-size: 0.8rem;
      color: #b00020;
    }
    .todo-form__submit,
    .todo-form__cancel {
      flex: none;
      cursor: pointer;
    }
    .todo-form__submit:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `,
})
export class TodoForm {
  /** Initial field values; changing this re-populates the form (used when entering edit mode). */
  readonly value = input<NewTodo>({ title: '', description: '' });

  /** When true (e.g. a save is in flight), the form will not submit. */
  readonly disabled = input(false);

  /** Text on the submit button — e.g. "Add" or "Save". */
  readonly submitLabel = input('Add');

  /** When true, renders a Cancel button that emits `cancel` (used in edit mode). */
  readonly showCancel = input(false);

  readonly save = output<NewTodo>();
  readonly cancel = output<void>();

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

  constructor() {
    // Pre-fill (and re-fill) the form whenever the initial value changes — e.g. when the
    // parent opens this form in edit mode for a specific todo.
    effect(() => this.form.reset(this.value()));
  }

  protected submit(): void {
    const title = this.form.controls.title.value.trim();
    if (this.disabled() || this.form.invalid || title.length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    // Note: the form is NOT cleared here. For add, the parent calls reset() only once the
    // save succeeds, so the user's text is preserved if the request fails.
    this.save.emit({ title, description: this.form.controls.description.value.trim() });
  }

  /** Clears the form back to its initial value. Called by the parent after a successful add. */
  reset(): void {
    this.form.reset(this.value());
  }
}
