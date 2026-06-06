import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <img
          src="/img/logonew.png"
          alt="PlayerIX"
          class="login-logo"
        />
        <p class="subtitle">
          Creá tu cuenta de scouting
        </p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              class="form-control"
              [class.field-error]="
                registerForm.get('email')?.invalid && registerForm.get('email')?.touched
              "
              placeholder="scout@playerix.com"
            />
            <div
              class="field-feedback"
              *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
              Ingresá un email válido
            </div>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              formControlName="password"
              class="form-control"
              [class.field-error]="
                registerForm.get('password')?.invalid && registerForm.get('password')?.touched
              "
              placeholder="••••••••"
            />
            <div
              class="field-feedback"
              *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
              Mínimo 6 caracteres
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="btn btn-primary login-btn"
            [class.btn-disabled]="registerForm.invalid"
          >
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
          </button>

          <div *ngIf="errorMessage" class="error-message">
            <span class="icon">⚠️</span> {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            <span class="icon">✓</span> {{ successMessage }}
          </div>
        </form>

        <div class="register-link">
          ¿Ya tenés cuenta? <a routerLink="/login">Iniciar sesión</a>
        </div>

        <div class="card-footer">Herramienta Oficial de Scouting v2.0</div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: radial-gradient(circle at center, #1a1f26 0%, #0b0e14 100%);
      }
      .login-card {
        width: 100%;
        max-width: 450px;
        background: var(--card-bg);
        padding: 50px;
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.05);
        text-align: center;
      }
      .login-logo {
        max-width: 260px;
        margin-bottom: 30px;
      }
      h2 {
        margin: 0;
        font-size: 1.5rem;
        text-transform: uppercase;
        color: var(--text-primary);
      }
      .subtitle {
        color: var(--text-secondary);
        margin-bottom: 40px;
        font-size: 0.9rem;
      }
      .form-group {
        text-align: left;
        margin-bottom: 25px;
      }
      .form-group label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 8px;
        font-weight: bold;
      }
      .form-control {
        width: 100%;
        background: #2a2f3a;
        border: 1px solid #444;
        color: white;
        padding: 12px 15px;
        border-radius: 6px;
        outline: none;
        transition: border-color 0.3s;
      }
      .form-control:focus {
        border-color: var(--accent-color);
      }
      .field-error {
        border-color: var(--danger, #dc3545) !important;
      }
      .field-feedback {
        font-size: 0.75rem;
        color: var(--danger, #dc3545);
        margin-top: 4px;
      }
      .btn-disabled {
        opacity: 0.5;
      }
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 6px;
        vertical-align: middle;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .login-btn {
        margin-top: 10px;
        padding: 15px;
        font-size: 1rem;
      }
      .error-message {
        margin-top: 20px;
        padding: 10px;
        background: rgba(220, 53, 69, 0.1);
        color: var(--danger);
        border-radius: 4px;
        font-size: 0.85rem;
        border: 1px solid rgba(220, 53, 69, 0.2);
      }
      .success-message {
        margin-top: 20px;
        padding: 14px;
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
        border-radius: 4px;
        font-size: 0.9rem;
        border: 1px solid rgba(40, 167, 69, 0.3);
        font-weight: bold;
      }
      .register-link {
        margin-top: 20px;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .register-link a {
        color: var(--accent-color);
        text-decoration: none;
      }
      .register-link a:hover {
        text-decoration: underline;
      }
      .card-footer {
        margin-top: 40px;
        font-size: 0.7rem;
        color: #444;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage = '¡Usuario creado correctamente!';
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { registered: 'true' },
            });
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 409) {
            this.errorMessage = 'Ese email ya está registrado';
          } else {
            this.errorMessage =
              err.error?.message || err.message || 'Error al registrarse';
          }
        },
      });
    }
  }
}
