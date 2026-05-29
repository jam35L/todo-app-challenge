import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { Todo } from '../todo.model';
import { TodoService } from '../todo.service';
import { NewTodo, TodoForm } from '../todo-form/todo-form';
import { TodoItem } from '../todo-item/todo-item';

/**
 * Smart container: owns the TODO list state (loading / error / items as signals),
 * loads on init, and wires the add/edit/delete actions through to the API.
 */
@Component({
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodoForm, TodoItem],
  template: `
    <section class="todo">
      <h1 class="todo__heading">My TODO list</h1>

      <app-todo-form [disabled]="adding()" (save)="add($event)" />

      @if (error()) {
        <p class="todo__error" role="alert">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="todo__status">Loading…</p>
      } @else if (todos().length === 0) {
        <p class="todo__status todo__empty">
          Nothing to do yet. Add your first task above.
        </p>
      } @else {
        <ul class="todo__list">
          @for (todo of todos(); track todo.id) {
            <li class="todo__list-item">
              <app-todo-item
                [todo]="todo"
                [editing]="editingId() === todo.id"
                [saving]="savingId() === todo.id"
                (startEdit)="editingId.set(todo.id)"
                (cancelEdit)="editingId.set(null)"
                (save)="update(todo.id, $event)"
                (delete)="remove($event)"
              />
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .todo {
      max-width: 32rem;
      margin: 0 auto;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .todo__heading {
      margin: 0;
      font-size: 1.5rem;
    }
    .todo__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .todo__status {
      color: #666;
    }
    .todo__error {
      color: #b00020;
      margin: 0;
    }
  `,
})
export class TodoList implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly addForm = viewChild.required(TodoForm);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly loading = signal(false);
  protected readonly adding = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Id of the todo currently being edited (null = none), and the one whose save is in flight. */
  protected readonly editingId = signal<string | null>(null);
  protected readonly savingId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.todoService.list().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your todos. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected add({ title, description }: NewTodo): void {
    if (this.adding()) {
      return;
    }

    this.adding.set(true);
    this.error.set(null);
    this.todoService.add(title, description).subscribe({
      next: (created) => {
        this.todos.update((items) => [created, ...items]);
        this.addForm().reset();
        this.adding.set(false);
      },
      error: () => {
        this.error.set('Could not add the task. Please try again.');
        this.adding.set(false);
      },
    });
  }

  protected update(id: string, { title, description }: NewTodo): void {
    if (this.savingId()) {
      return;
    }

    this.savingId.set(id);
    this.error.set(null);
    this.todoService.update(id, title, description).subscribe({
      next: (updated) => {
        this.todos.update((items) => items.map((t) => (t.id === id ? updated : t)));
        this.editingId.set(null);
        this.savingId.set(null);
      },
      error: () => {
        // Leave the row in edit mode so the user's changes aren't lost.
        this.error.set('Could not update the task. Please try again.');
        this.savingId.set(null);
      },
    });
  }

  protected remove(id: string): void {
    this.error.set(null);
    this.todoService.remove(id).subscribe({
      next: () => this.todos.update((items) => items.filter((t) => t.id !== id)),
      error: () => this.error.set('Could not delete the task. Please try again.'),
    });
  }
}
