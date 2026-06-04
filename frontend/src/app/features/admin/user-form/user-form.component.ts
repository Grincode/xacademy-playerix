import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
        <a routerLink="/admin/users" class="btn btn-secondary">
          Volver
        </a>
      </div>

      <div class="card">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="user@example.com"
            />
          </div>

          <div class="form-group">
            <label>Contraseña{{ isEdit ? ' (dejar vacío para mantener)' : '' }}</label>
            <input
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select formControlName="role" class="form-control">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            [disabled]="userForm.invalid || submitting"
            class="btn btn-primary"
          >
            {{ isEdit ? 'Actualizar' : 'Crear' }}
          </button>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-page {
        max-width: 500px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .page-header h2 {
        margin: 0;
      }
      .card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .form-group {
        margin-bottom: 20px;
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
      }
      .form-control:focus {
        border-color: var(--accent-color);
      }
      .error-message {
        margin-top: 16px;
        padding: 10px;
        background: rgba(220, 53, 69, 0.1);
        color: var(--danger);
        border-radius: 4px;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId?: number;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['user', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.isEdit = !!this.userId;
    if (this.isEdit) {
      this.userService.findOne(this.userId!).subscribe({
        next: (user) => {
          this.userForm.patchValue({ email: user.email, role: user.role });
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        },
      });
    } else {
      this.userForm
        .get('password')
        ?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    this.submitting = true;
    this.error = '';

    const { email, password, role } = this.userForm.value;

    if (this.isEdit) {
      const dto: any = { email, role };
      if (password) dto.password = password;
      this.userService.update(this.userId!, dto).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar usuario';
          this.submitting = false;
        },
      });
    } else {
      this.userService.create({ email, password, role }).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error = err.error?.message || 'Error al crear usuario';
          this.submitting = false;
        },
      });
    }
  }
}
