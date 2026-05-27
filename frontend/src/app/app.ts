import { Component } from '@angular/core';

import { TodoList } from './todo/todo-list/todo-list';

@Component({
  selector: 'app-root',
  imports: [TodoList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
