import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Todo } from '../todo.model';
import { NewTodo, TodoForm } from '../todo-form/todo-form';

/**
 * Presentational: shows a single TODO, or — when `editing` — an inline edit form.
 * Raises `delete`, `startEdit`, `cancelEdit`, and `save`; the parent owns the edit state.
 */
@Component({
  selector: 'app-todo-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TodoForm],
  template: `
    @if (editing()) {
      <div class="todo-item todo-item--editing">
        <app-todo-form
          class="todo-item__form"
          [value]="formValue()"
          [disabled]="saving()"
          submitLabel="Save"
          [showCancel]="true"
          (save)="save.emit($event)"
          (cancel)="cancelEdit.emit()"
        />
      </div>
    } @else {
      <div class="todo-item">
        <div class="todo-item__text">
          <span class="todo-item__title">{{ todo().title }}</span>
          @if (todo().description) {
            <p class="todo-item__description">{{ todo().description }}</p>
          }
          <time class="todo-item__date" [attr.datetime]="todo().createdAtUtc">
            {{ todo().createdAtUtc | date: 'M/d/yy, h:mm:ss a' }}
          </time>
        </div>
        <div class="todo-item__actions">
          <button
            type="button"
            class="todo-item__edit"
            [attr.aria-label]="'Edit ' + todo().title"
            (click)="startEdit.emit()"
          >
            Edit
          </button>
          <button
            type="button"
            class="todo-item__delete"
            [attr.aria-label]="'Delete ' + todo().title"
            (click)="delete.emit(todo().id)"
          >
            Delete
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid #e2e2e2;
      border-radius: 8px;
      background: #fff;
    }
    .todo-item--editing {
      align-items: stretch;
    }
    .todo-item__form {
      flex: 1 1 auto;
    }
    .todo-item__text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .todo-item__title {
      font-weight: 500;
      word-break: break-word;
    }
    .todo-item__description {
      margin: 0.15rem 0 0;
      font-size: 0.85rem;
      color: #555;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .todo-item__date {
      font-size: 0.75rem;
      color: #777;
    }
    .todo-item__actions {
      flex: none;
      display: flex;
      gap: 0.5rem;
    }
    .todo-item__edit,
    .todo-item__delete {
      cursor: pointer;
    }
  `,
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  readonly editing = input(false);
  readonly saving = input(false);

  readonly delete = output<string>();
  readonly startEdit = output<void>();
  readonly cancelEdit = output<void>();
  readonly save = output<NewTodo>();

  /** Maps the todo onto the form's value shape (null description → empty string). */
  protected readonly formValue = computed<NewTodo>(() => ({
    title: this.todo().title,
    description: this.todo().description ?? '',
  }));
}
