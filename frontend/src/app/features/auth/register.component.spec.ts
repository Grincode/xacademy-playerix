import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import RegisterComponent from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have an invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should have a valid form with valid email and password', () => {
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('password123');
    expect(component.registerForm.valid).toBeTrue();
  });

  it('should call authService.register on submit and navigate to /players', () => {
    const mockResponse = { access_token: 'jwt-token' };
    authService.register.and.returnValue(of(mockResponse));

    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('password123');

    const routerSpy = spyOn(component['router'], 'navigate');

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(routerSpy).toHaveBeenCalledWith(['/players']);
  });

  it('should show error message on registration failure', () => {
    authService.register.and.returnValue(
      throwError(() => new Error('Email already in use')),
    );

    component.registerForm.controls['email'].setValue('existing@example.com');
    component.registerForm.controls['password'].setValue('password123');

    component.onSubmit();

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Email already in use');
    const errorEl: HTMLElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Email already in use');
  });

  it('should have submit button disabled when form is invalid', () => {
    component.registerForm.controls['email'].setValue('');
    component.registerForm.controls['password'].setValue('');
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn.disabled).toBeTrue();
  });

  it('should have submit button text "Crear Cuenta"', () => {
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn.textContent).toContain('Crear Cuenta');
  });
});
