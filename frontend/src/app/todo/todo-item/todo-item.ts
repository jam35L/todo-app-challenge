import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Todo } from '../todo.model';

/** Presentational: shows a single TODO and raises `delete` with its id. */
@Component({
  selector: 'app-todo-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
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
      <button
        type="button"
        class="todo-item__delete"
        [attr.aria-label]="'Delete ' + todo().title"
        (click)="delete.emit(todo().id)"
      >
        Delete
      </button>
    </div>
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
    .todo-item__delete {
      flex: none;
      cursor: pointer;
    }
  `,
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  readonly delete = output<string>();
}
