import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { App } from './app';
import { environment } from '../environments/environment';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the app and renders the todo list', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // App hosts <app-todo-list>, which loads its items on init.
    httpMock.expectOne(`${environment.apiBaseUrl}/todos`).flush([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('My TODO list');
  });
});
