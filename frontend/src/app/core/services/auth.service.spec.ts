import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('register', () => {
    it('should POST to /api/auth/register, store token, and update currentUser', () => {
      const credentials: { email: string; password: string } = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        access_token:
          'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.signature',
      };

      let result: AuthResponse | undefined;

      authService.register(credentials).subscribe((res: AuthResponse) => {
        result = res;
      });

      const req: TestRequest = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe(
        mockResponse.access_token,
      );
      expect(authService.currentUser()).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should not update currentUser on error', () => {
      const credentials: { email: string; password: string } = {
        email: 'test@example.com',
        password: 'password123',
      };

      const errorResponse = { status: 409, statusText: 'Conflict' };

      let receivedError: HttpErrorResponse | undefined;

      authService.register(credentials).subscribe({
        next: () => fail('should have failed with 409'),
        error: (err: HttpErrorResponse) => {
          receivedError = err;
        },
      });

      const req: TestRequest = httpMock.expectOne('/api/auth/register');
      req.flush(
        { message: 'Email already in use' },
        errorResponse,
      );

      expect(receivedError).toBeDefined();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(authService.currentUser()).toBeNull();
    });
  });
});
