import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlayersService } from '../../../core/services/players.service';
import { ExportService } from '../../../core/services/export.service';
import { AuthService } from '../../../core/services/auth.service';
import { Player } from '../../../core/models/player.model';
import { FitTextDirective } from '../../../core/directives/fit-text.directive';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FitTextDirective],
  template: `
    <div class="container">
      <div class="header-actions">
        <img
          src="/img/logonew.png"
          alt="PlayerIX"
          class="header-logo"
        />
        <div class="actions">
          <div class="view-toggle">
            <button
              (click)="viewMode = 'grid'"
              [class.active]="viewMode === 'grid'"
              class="toggle-btn"
            >
              <span class="icon">𐄹</span> Fichas
            </button>
            <button
              (click)="viewMode = 'table'"
              [class.active]="viewMode === 'table'"
              class="toggle-btn"
            >
              <span class="icon">☰</span> Tabla
            </button>
          </div>
          <button routerLink="/players/new" class="btn btn-primary">
            Nuevo Jugador
          </button>

          <input
            type="file"
            #csvInput
            hidden
            (change)="onFileSelected($event)"
            accept=".csv"
          />
          <button
            (click)="csvInput.click()"
            class="btn btn-warning"
            [disabled]="isUploading"
          >
            {{ isUploading ? 'Importando...' : 'Importar CSV' }}
          </button>

          <button (click)="exportData()" class="btn btn-success">
            Exportar Excel
          </button>
          <a
            *ngIf="authService.isAdmin()"
            routerLink="/admin/users"
            class="btn btn-secondary"
          >
            Admin
          </a>
          <button (click)="logout()" class="btn btn-danger">Salir</button>
        </div>
      </div>

      <div class="filters-panel">
        <input
          [(ngModel)]="filters.name"
          (input)="onSearchChange()"
          placeholder="Nombre..."
          class="form-control"
        />
        <input
          [(ngModel)]="filters.club"
          (input)="onSearchChange()"
          placeholder="Club..."
          class="form-control"
        />
        <input
          [(ngModel)]="filters.nationality"
          (input)="onSearchChange()"
          placeholder="Nacionalidad..."
          class="form-control"
        />
        <select
          [(ngModel)]="filters.fifaVersion"
          (change)="loadPlayers()"
          class="form-control"
        >
          <option [ngValue]="undefined">Todas las Versiones</option>
          <option [ngValue]="15">FIFA 15</option>
          <option [ngValue]="16">FIFA 16</option>
          <option [ngValue]="17">FIFA 17</option>
          <option [ngValue]="18">FIFA 18</option>
          <option [ngValue]="19">FIFA 19</option>
          <option [ngValue]="20">FIFA 20</option>
          <option [ngValue]="21">FIFA 21</option>
          <option [ngValue]="22">FIFA 22</option>
          <option [ngValue]="23">FIFA 23</option>
          <option [ngValue]="24">FC 24</option>
        </select>
        <select
          [(ngModel)]="filters.position"
          (change)="loadPlayers()"
          class="form-control"
        >
          <option value="">Todas las Posiciones</option>
          <option value="GK">Arquero</option>
          <option value="DEF">Defensor</option>
          <option value="MID">Mediocampista</option>
          <option value="FWD">Delantero</option>
        </select>
      </div>

      <div *ngIf="players.length === 0" class="no-results">
        <div class="no-results-content">
          <span class="no-results-icon">🔍</span>
          <h3>No se encontraron jugadores</h3>
          <p>Probá ajustando los filtros de búsqueda.</p>
          <button (click)="resetFilters()" class="btn btn-secondary">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div
        *ngIf="viewMode === 'grid' && players.length > 0"
        class="player-grid"
      >
        <div
          *ngFor="let player of players"
          class="fut-card-wrapper"
          [class.male-card]="player.gender === 'male'"
          [class.female-card]="player.gender === 'female'"
          [class.gold-wrapper]="player.overallRating >= 90"
          [routerLink]="['/players', player.id]"
        >
          <div
            class="fut-player-card"
            [class.gold-card]="player.overallRating >= 90"
            [class.silver-card]="player.overallRating < 90"
          >
            <div *ngIf="player.overallRating >= 90" class="shine-layer"></div>

            <div class="player-card-top">
              <div class="player-master-info">
                <div class="player-rating">
                  <span>{{ player.overallRating }}</span>
                </div>
                <div class="player-position">
                  <span [appFitText]="player.position" [maxFontSize]="18">{{
                    player.position
                  }}</span>
                </div>
                <div class="player-nation">
                  <img
                    [src]="
                      'https://cdn.sofifa.net/flags/' +
                      player.nationalityId +
                      '.png'
                    "
                    [alt]="player.nationality"
                    referrerpolicy="no-referrer"
                    (error)="onImageError($event, 'nation')"
                  />
                </div>
                <div class="player-club">
                  <img
                    [src]="
                      'https://cdn.sofifa.net/teams/' +
                      player.clubTeamId +
                      '/light_60.png'
                    "
                    [alt]="player.club"
                    referrerpolicy="no-referrer"
                    (error)="onImageError($event, 'club')"
                  />
                </div>
              </div>
              <div class="player-picture">
                <img
                  *ngIf="player.playerFaceUrl"
                  [src]="player.playerFaceUrl"
                  [alt]="player.name"
                  referrerpolicy="no-referrer"
                  (error)="onImageError($event, 'player')"
                />
                <img
                  *ngIf="!player.playerFaceUrl"
                  src="https://cdn.sofifa.net/players/notfound_0_120.png"
                  alt="No Encontrado"
                  referrerpolicy="no-referrer"
                />
              </div>
            </div>

            <div class="player-card-bottom">
              <div class="player-name">
                <span
                  [appFitText]="getDisplayName(player.name)"
                  [maxFontSize]="22"
                  >{{ getDisplayName(player.name) }}</span
                >
              </div>

              <div *ngIf="player.position !== 'GK'" class="player-features">
                <div class="player-features-col">
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'pace') }}
                    </div>
                    <div class="player-feature-title">RIT</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'shooting') }}
                    </div>
                    <div class="player-feature-title">TIRO</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'passing') }}
                    </div>
                    <div class="player-feature-title">PAS</div></span
                  >
                </div>
                <div class="player-features-col">
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'dribbling') }}
                    </div>
                    <div class="player-feature-title">REG</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'defending') }}
                    </div>
                    <div class="player-feature-title">DEF</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'physical') }}
                    </div>
                    <div class="player-feature-title">FIS</div></span
                  >
                </div>
              </div>

              <div *ngIf="player.position === 'GK'" class="player-features">
                <div class="player-features-col">
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'gkDiving') }}
                    </div>
                    <div class="player-feature-title">DIV</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'gkHandling') }}
                    </div>
                    <div class="player-feature-title">HAN</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'gkKicking') }}
                    </div>
                    <div class="player-feature-title">PAT</div></span
                  >
                </div>
                <div class="player-features-col">
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'gkReflexes') }}
                    </div>
                    <div class="player-feature-title">REF</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'gkSpeed') }}
                    </div>
                    <div class="player-feature-title">VEL</div></span
                  >
                  <span
                    ><div class="player-feature-value">
                      {{ getStat(player, 'gkPositioning') }}
                    </div>
                    <div class="player-feature-title">POS</div></span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="viewMode === 'table' && players.length > 0"
        class="table-view"
      >
        <table class="scouting-table">
          <thead>
            <tr>
              <th>OVR</th>
              <th>NOMBRE</th>
              <th>POS</th>
              <th>CLUB</th>
              <th>NAC</th>
              <th>EDAD</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let player of players"
              [class.high-rated]="player.overallRating >= 90"
              [class.male-row]="player.gender === 'male'"
              [class.female-row]="player.gender === 'female'"
            >
              <td class="td-ovr">
                <span>{{ player.overallRating }}</span>
              </td>
              <td class="td-name">{{ getDisplayName(player.name) }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.club }}</td>
              <td>{{ player.nationality }}</td>
              <td>{{ player.age }}</td>
              <td>
                <button [routerLink]="['/players', player.id]" class="btn-view">
                  VER PERFIL
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="players.length > 0">
        <button
          [disabled]="filters.page === 1"
          (click)="changePage(-1)"
          class="btn btn-secondary"
        >
          ANTERIOR
        </button>
        <span class="page-info"
          >PÁGINA {{ filters.page }} DE {{ totalPages }}</span
        >
        <button
          [disabled]="filters.page >= totalPages"
          (click)="changePage(1)"
          class="btn btn-secondary"
        >
          SIGUIENTE
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 40px 20px;
        min-height: 100vh;
        font-family: 'Saira Semi Condensed', sans-serif;
      }
      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 20px;
      }
      .header-actions h2 {
        margin: 0;
        font-size: 2rem;
        color: var(--accent-color);
        text-transform: uppercase;
      }
      .header-logo {
        height: 48px;
      }
      .actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .view-toggle {
        display: flex;
        background: #1a1f26;
        border-radius: 6px;
        padding: 4px;
        border: 1px solid #333;
      }
      .toggle-btn {
        background: transparent;
        color: #777;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: bold;
        transition: all 0.3s;
      }
      .toggle-btn.active {
        background: #2a2f3a;
        color: var(--accent-color);
      }

      .filters-panel {
        display: flex;
        gap: 15px;
        margin-bottom: 40px;
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 8px;
      }
      .form-control {
        background: #2a2f3a;
        border: 1px solid #444;
        color: white;
        padding: 12px 15px;
        border-radius: 4px;
        flex: 1;
        outline: none;
      }
      .form-control:focus {
        border-color: var(--accent-color);
      }

      .player-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 40px;
        justify-items: center;
      }

      .fut-card-wrapper {
        position: relative;
        width: 260px;
        height: 380px;
        padding: 5px;
        cursor: pointer;
        transition: all 0.4s ease-out;
        filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4));
      }
      .fut-card-wrapper:hover {
        transform: translateY(-15px) scale(1.02);
        z-index: 10;
        filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.6));
      }
      .fut-player-card {
        position: relative;
        width: 100%;
        height: 100%;
        background: #1a1f26;
        border: none;
        clip-path: polygon(0% 0%, 100% 0%, 100% 82%, 50% 100%, 0% 82%);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .gold-card {
        background: linear-gradient(160deg, #d4af37 0%, #a67c00 100%);
      }
      .male-card {
        filter: drop-shadow(0 15px 35px rgba(135, 206, 235, 0.2));
      }
      .female-card {
        filter: drop-shadow(0 15px 35px rgba(255, 182, 193, 0.2));
      }
      .gold-wrapper {
        filter: drop-shadow(0 15px 35px rgba(212, 175, 55, 0.4)) !important;
      }
      .silver-card {
        background: linear-gradient(160deg, #1e242c 0%, #11151a 100%);
      }
      .fut-player-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%,
          rgba(0, 0, 0, 0.1) 100%
        );
        pointer-events: none;
      }
      .player-card-top {
        display: flex;
        padding: 25px 15px 0;
        height: 210px;
        position: relative;
      }
      .player-master-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 55px;
        z-index: 10;
      }
      .gold-card .player-master-info {
        color: #2a2107;
      }
      .silver-card .player-master-info {
        color: #87ceeb;
      }
      .player-rating {
        font-size: 2.8rem;
        font-weight: 800;
        line-height: 0.8;
        margin-bottom: 5px;
      }
      .player-position {
        height: 25px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        margin-bottom: 8px;
        overflow: hidden;
      }
      .player-position span {
        font-weight: 600;
        white-space: nowrap;
        display: inline-block;
      }
      .player-nation,
      .player-club {
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        margin: 2px 0;
      }
      .player-nation img,
      .player-club img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .player-picture {
        position: absolute;
        right: 5px;
        bottom: 0;
        width: 180px;
        height: 160px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        z-index: 5;
      }
      .player-picture img {
        height: 100%;
        width: auto;
        object-fit: contain;
        filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4));
      }
      .player-card-bottom {
        position: relative;
        background: rgba(0, 0, 0, 0.15);
        padding: 10px 10px 55px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 10;
        flex: 1;
      }
      .player-name {
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-bottom: 12px;
        color: inherit;
        text-align: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding-bottom: 5px;
        overflow: hidden;
      }
      .player-name span {
        font-weight: 800;
        text-transform: uppercase;
        white-space: nowrap;
        display: inline-block;
      }
      .gold-card .player-name {
        color: #2a2107;
        border-color: rgba(42, 33, 7, 0.2);
      }
      .silver-card .player-name {
        color: #eee;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .player-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        width: 100%;
        padding: 0 15px;
      }
      .player-features-col {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .player-features-col span {
        display: flex;
        gap: 8px;
        font-size: 1rem;
        font-weight: 700;
      }
      .gold-card .player-feature-value {
        color: #2a2107;
      }
      .gold-card .player-feature-title {
        color: #4b3b0d;
        opacity: 0.8;
      }
      .silver-card .player-feature-value {
        color: #eee;
      }
      .silver-card .player-feature-title {
        color: #888;
      }
      .player-feature-title {
        font-weight: 400;
        font-size: 0.85rem;
      }

      .shine-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
        pointer-events: none;
        overflow: hidden;
      }
      .shine-layer::after {
        content: '';
        position: absolute;
        top: -100%;
        left: -100%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0) 45%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 55%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: fut-shine 16s infinite linear;
        transform: rotate(15deg);
      }
      @keyframes fut-shine {
        0% {
          transform: translateX(-100%) translateY(-100%) rotate(15deg);
        }
        30% {
          transform: translateX(100%) translateY(100%) rotate(15deg);
        }
        100% {
          transform: translateX(100%) translateY(100%) rotate(15deg);
        }
      }

      /* Table View */
      .scouting-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 10px;
      }
      .scouting-table th {
        text-align: left;
        padding: 15px;
        color: #555;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .scouting-table tbody tr {
        background: #1a1f26;
        transition: all 0.3s;
      }
      .scouting-table tbody tr:hover {
        transform: scale(1.01);
        background: #222831;
      }
      .scouting-table td {
        padding: 15px;
        color: #eee;
        border-top: 1px solid #333;
        border-bottom: 1px solid #333;
      }
      .scouting-table td:first-child {
        border-left: 1px solid #333;
        border-radius: 8px 0 0 8px;
      }
      .scouting-table td:last-child {
        border-right: 1px solid #333;
        border-radius: 0 8px 8px 0;
      }
      .td-ovr span {
        background: #333;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 900;
        color: #eee;
      }
      .male-row .td-ovr span {
        color: #87ceeb;
        border: 1px solid rgba(135, 206, 235, 0.3);
      }
      .female-row .td-ovr span {
        color: #ffb6c1;
        border: 1px solid rgba(255, 182, 193, 0.3);
      }
      .high-rated .td-ovr span {
        background: var(--gold-primary);
        color: #000 !important;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        border: none;
      }
      .td-name {
        font-weight: bold;
        text-transform: uppercase;
      }
      .btn-view {
        background: transparent;
        border: 1px solid #555;
        color: #eee;
        padding: 5px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.7rem;
        font-weight: bold;
        transition: all 0.3s;
      }
      .male-row .btn-view {
        border-color: #87ceeb;
        color: #87ceeb;
      }
      .female-row .btn-view {
        border-color: #ffb6c1;
        color: #ffb6c1;
      }
      .male-row .btn-view:hover {
        background: #87ceeb;
        color: #000;
      }
      .female-row .btn-view:hover {
        background: #ffb6c1;
        color: #000;
      }

      .btn-warning {
        background: #ffcc00;
        color: #000;
        font-weight: bold;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }
      .btn-warning:hover:not(:disabled) {
        background: #e6b800;
        transform: scale(1.05);
      }
      .btn-warning:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-danger {
        background: #dc3545;
        color: #fff;
        font-weight: bold;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }
      .btn-danger:hover {
        background: #b02a37;
        transform: scale(1.05);
      }

      .pagination {
        margin-top: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }
      .page-info {
        font-weight: bold;
        letter-spacing: 2px;
        color: var(--text-secondary);
      }

      .no-results {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        border: 1px dashed #444;
      }
      .no-results-content {
        text-align: center;
      }
      .no-results-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 10px;
      }
      .no-results h3 {
        color: var(--accent-color);
        margin-bottom: 5px;
      }
      .no-results p {
        color: var(--text-secondary);
        margin-bottom: 20px;
      }
    `,
  ],
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];
  viewMode: 'grid' | 'table' = 'grid';
  total: number = 0;
  totalPages: number = 0;
  isUploading: boolean = false;
  searchTimeout: any;

  filters: any = {
    name: '',
    club: '',
    nationality: '',
    position: '',
    fifaVersion: undefined,
    page: 1,
    limit: 10,
  };

  constructor(
    private playersService: PlayersService,
    private exportService: ExportService,
    protected authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.resetPagination();
    }, 400);
  }

  resetFilters(): void {
    this.filters = {
      name: '',
      club: '',
      nationality: '',
      position: '',
      fifaVersion: undefined,
      page: 1,
      limit: 10,
    };
    this.loadPlayers();
  }

  getStat(player: Player, stat: string): number {
    if (!player.skills || player.skills.length === 0) return 0;
    const latest = [...player.skills].sort(
      (a: any, b: any) => b.fifaVersion - a.fifaVersion,
    )[0];
    return Math.round((latest as any)[stat] ?? 0);
  }

  getDisplayName(name: string): string {
    if (!name) return '';
    if (name.includes(',')) {
      const parts = name.split(',').map((s) => s.trim());
      if (parts.length >= 2) {
        const [last, first] = parts;
        return `${first.charAt(0)}. ${last}`;
      }
    }
    return name;
  }

  loadPlayers(): void {
    this.playersService.getPlayers(this.filters).subscribe((response) => {
      this.players = response.data;
      this.total = response.total;
      this.totalPages = Math.ceil(this.total / this.filters.limit);
    });
  }

  exportData(): void {
    this.playersService.getPlayers({ ...this.filters, page: 1, limit: 10, export: true }).subscribe((response) => {
      this.exportService.exportToExcel(response.data, 'fifa_players_export');
    });
  }

  onImageError(event: any, type: 'nation' | 'club' | 'player'): void {
    if (type === 'player') {
      event.target.src = 'https://cdn.sofifa.net/players/notfound_0_120.png';
    } else {
      event.target.style.display = 'none';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.playersService.importCsv(file).subscribe({
        next: (res: any) => {
          this.isUploading = false;
          alert(
            `Importación finalizada:\n- Creados: ${res.created}\n- Actualizados: ${res.updated}\n- Errores: ${res.errors}`,
          );
          this.resetPagination();
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Import failed', err);
          alert('Error crítico al importar el archivo.');
        },
      });
    }
  }

  changePage(delta: number): void {
    this.filters.page += delta;
    this.loadPlayers();
  }

  resetPagination(): void {
    this.filters.page = 1;
    this.loadPlayers();
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
