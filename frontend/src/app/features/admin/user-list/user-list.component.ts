import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, AppUser } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h2>Usuarios</h2>
        <div class="header-actions">
          <a routerLink="/players" class="btn btn-secondary">
            ← Jugadores
          </a>
          <a routerLink="/admin/users/new" class="btn btn-primary">
            + Nuevo Usuario
          </a>
        </div>
      </div>

      <div class="card">
        <table class="table" *ngIf="users.length > 0; else empty">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span [class.admin-badge]="user.role === 'admin'">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <a
                  [routerLink]="['/admin/users', user.id, 'edit']"
                  class="btn btn-sm btn-secondary"
                >
                  Editar
                </a>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteUser(user)"
                  [disabled]="user.role === 'admin'"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #empty>
          <p class="empty-state">No hay usuarios registrados</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-page {
        max-width: 900px;
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
      .header-actions {
        display: flex;
        gap: 8px;
      }
      .card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      .table th,
      .table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .table th {
        color: var(--text-secondary);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .admin-badge {
        background: rgba(255, 193, 7, 0.15);
        color: #ffc107;
        padding: 2px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
      }
      .empty-state {
        text-align: center;
        color: var(--text-secondary);
        padding: 40px 0;
      }
      .btn-sm {
        padding: 4px 12px;
        font-size: 0.8rem;
        margin-right: 8px;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  users: AppUser[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.findAll().subscribe({
      next: (users) => (this.users = users),
      error: () => (this.users = []),
    });
  }

  deleteUser(user: AppUser): void {
    if (!confirm(`Delete user ${user.email}?`)) return;
    this.userService.remove(user.id).subscribe({
      next: () => this.loadUsers(),
    });
  }
}
