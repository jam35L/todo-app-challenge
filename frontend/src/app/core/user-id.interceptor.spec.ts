import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { USER_ID_STORAGE_KEY, userIdInterceptor } from './user-id.interceptor';

describe('userIdInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([userIdInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds a non-empty X-User-Id header to outgoing requests', () => {
    http.get('/api/todos').subscribe();

    const req = httpMock.expectOne('/api/todos');
    expect(req.request.headers.get('X-User-Id')).toBeTruthy();
    req.flush([]);
  });

  it('persists the generated id and reuses it across requests', () => {
    http.get('/a').subscribe();
    const req1 = httpMock.expectOne('/a');
    const id1 = req1.request.headers.get('X-User-Id');
    req1.flush(null);

    http.get('/b').subscribe();
    const req2 = httpMock.expectOne('/b');
    const id2 = req2.request.headers.get('X-User-Id');
    req2.flush(null);

    expect(id1).toBe(id2);
    expect(localStorage.getItem(USER_ID_STORAGE_KEY)).toBe(id1);
  });

  it('reuses an id already present in storage', () => {
    localStorage.setItem(USER_ID_STORAGE_KEY, 'existing-id');

    http.get('/a').subscribe();

    const req = httpMock.expectOne('/a');
    expect(req.request.headers.get('X-User-Id')).toBe('existing-id');
    req.flush(null);
  });
});
