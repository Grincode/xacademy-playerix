import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <img
          src="/img/playerix_logo.png"
          alt="PlayerIX"
          class="login-logo"
        />
        <p class="subtitle">
          Portal de Scouting — Ingresá tus credenciales
        </p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email del Staff</label>
            <input
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="staff@playerix.com"
            />
          </div>

          <div class="form-group">
            <label>Contraseña Segura</label>
            <input
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid"
            class="btn btn-primary login-btn"
          >
            Ingresar
          </button>

          <div *ngIf="errorMessage" class="error-message">
            <span class="icon">⚠️</span> {{ errorMessage }}
          </div>
        </form>

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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/players']),
        error: (err) => (this.errorMessage = 'Email o contraseña incorrectos'),
      });
    }
  }
}
