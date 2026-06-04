import {
  Component,
  OnInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlayersService } from '../../../core/services/players.service';
import { FitTextDirective } from '../../../core/directives/fit-text.directive';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FitTextDirective],
  template: `
    <div class="container" *ngIf="player()">
      <div class="detail-header">
        <button routerLink="/players" class="btn btn-secondary">
          &larr; Volver a la Base
        </button>
        <div class="title-group">
          <div
            class="player-thumb"
            [class.gold-thumb]="player()?.overallRating >= 90"
            [class.female-thumb]="player()?.gender === 'female'"
          >
            <div
              class="shine-effect"
              *ngIf="player()?.overallRating >= 90"
            ></div>
            <img
              [src]="
                player()?.playerFaceUrl ||
                'https://cdn.sofifa.net/players/notfound_0_120.png'
              "
              alt="Player Face"
              referrerpolicy="no-referrer"
              (error)="onImageError($event, 'player')"
            />
          </div>
          <div class="title-text">
            <h1>
              {{ player()?.name }}
            </h1>
            <p class="full-name" *ngIf="player()?.longName">
              {{ player()?.longName }}
            </p>
          </div>
          <div class="meta-assets">
            <img
              class="meta-flag"
              [src]="
                'https://cdn.sofifa.net/flags/' +
                player()?.nationalityId +
                '.png'
              "
              [alt]="player()?.nationality"
              referrerpolicy="no-referrer"
              (error)="onImageError($event, 'nation')"
            />
            <img
              class="meta-club"
              [src]="
                'https://cdn.sofifa.net/teams/' +
                player()?.clubTeamId +
                '/light_60.png'
              "
              [alt]="player()?.club"
              referrerpolicy="no-referrer"
              (error)="onImageError($event, 'club')"
            />
          </div>
          <span
            class="badge"
            [class.gold-badge]="player()?.overallRating >= 90"
            [class.silver-badge]="player()?.overallRating < 90"
            [class.male]="player()?.gender === 'male'"
            [class.female]="player()?.gender === 'female'"
          >
            {{ player()?.overallRating }} OVR
          </span>
        </div>
        <button
          [routerLink]="['/players', player()?.id, 'edit']"
          class="btn btn-primary"
        >
          Editar Perfil
        </button>
      </div>

      <div class="detail-grid">
        <div class="stats-panel">
          <h3>Perfil Técnico</h3>
          <div class="profile-item">
            <span>CLUB</span> <strong>{{ player()?.club }}</strong>
          </div>
          <div class="profile-item">
            <span>NACIONALIDAD</span>
            <strong>{{ player()?.nationality }}</strong>
          </div>
          <div class="profile-item">
            <span>POSICIÓN</span> <strong>{{ player()?.position }}</strong>
          </div>
          <div class="profile-item">
            <span>POTENCIAL</span>
            <strong>{{ player()?.potential || '-' }}</strong>
          </div>
          <div class="profile-item">
            <span>EDAD</span> <strong>{{ player()?.age }}</strong>
          </div>
          <div class="profile-item">
            <span>GÉNERO</span>
            <strong>{{
              player()?.gender === 'male' ? 'MASCULINO' : 'FEMENINO'
            }}</strong>
          </div>
        </div>

        <div class="chart-panel">
          <h3>Radar de Atributos</h3>
          <div class="canvas-wrapper">
            <canvas #radarChart></canvas>
          </div>
        </div>
      </div>

      <div class="evolution-panel" *ngIf="versions().length > 1">
        <div class="panel-header">
          <h3>Evolución de Habilidad</h3>
          <select
            [(ngModel)]="selectedSkill"
            (change)="loadSkillTimeline()"
            class="skill-select"
          >
            <ng-container *ngIf="player()?.position !== 'GK'">
              <option value="pace">Ritmo (PACE)</option>
              <option value="shooting">Tiro (SHO)</option>
              <option value="passing">Pase (PAS)</option>
              <option value="dribbling">Regate (DRI)</option>
              <option value="defending">Defensa (DEF)</option>
              <option value="physical">Físico (PHY)</option>
            </ng-container>
            <ng-container *ngIf="player()?.position === 'GK'">
              <option value="gkDiving">Estirada (DIV)</option>
              <option value="gkHandling">Parada (HAN)</option>
              <option value="gkKicking">Saque (KIC)</option>
              <option value="gkReflexes">Reflejos (REF)</option>
              <option value="gkSpeed">Velocidad (SPD)</option>
              <option value="gkPositioning">Posicionamiento (POS)</option>
            </ng-container>
          </select>
        </div>
        <div class="line-canvas-wrapper">
          <canvas #lineChart></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 40px 20px;
        color: white;
        font-family: 'Saira Semi Condensed', sans-serif;
      }
      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 50px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 20px;
        width: 70%;
      }
      .player-thumb {
        position: relative;
        width: 100px;
        height: 100px;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--accent-color);
      }
      .player-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .gold-thumb {
        border-color: var(--gold-primary) !important;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
      }
      .female-thumb {
        border-color: #ffb6c1 !important;
        box-shadow: 0 0 15px rgba(255, 182, 193, 0.3);
      }
      .shine-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        overflow: hidden;
        border-radius: 50%;
      }
      .shine-effect::after {
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
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 55%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: thumb-shine 8s infinite linear;
        transform: rotate(15deg);
      }
      @keyframes thumb-shine {
        0% {
          transform: translateX(-100%) translateY(-100%) rotate(15deg);
        }
        20% {
          transform: translateX(100%) translateY(100%) rotate(15deg);
        }
        100% {
          transform: translateX(100%) translateY(100%) rotate(15deg);
        }
      }
      .title-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .title-group h1 {
        margin: 0;
        font-size: 2.2rem;
        color: var(--accent-color);
        word-break: break-word;
      }
      .full-name {
        margin: 4px 0 0;
        color: var(--text-secondary);
        font-size: 1rem;
      }
      .meta-assets {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .meta-flag {
        width: 40px;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }
      .meta-club {
        width: 45px;
        height: 45px;
        object-fit: contain;
      }
      .badge {
        padding: 5px 15px;
        background: #333;
        border-radius: 20px;
        font-weight: 900;
        font-size: 1.2rem;
        white-space: nowrap;
      }
      .gold-badge {
        background: linear-gradient(135deg, #ffd700, #b8860b);
        color: #000;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      }
      .silver-badge.male {
        background: linear-gradient(135deg, #87ceeb, #4682b4);
        color: #000;
        box-shadow: 0 0 15px rgba(135, 206, 235, 0.3);
      }
      .silver-badge.female {
        background: linear-gradient(135deg, #ffb6c1, #ff69b4);
        color: #000;
        box-shadow: 0 0 15px rgba(255, 182, 193, 0.3);
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 40px;
      }
      .stats-panel {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 12px;
        box-shadow: var(--card-shadow);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .stats-panel h3 {
        margin-top: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 25px;
      }
      .profile-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .profile-item span {
        color: var(--text-secondary);
        font-size: 0.8rem;
      }
      .profile-item strong {
        color: var(--accent-color);
      }
      .chart-panel {
        background: var(--card-bg);
        padding: 30px;
        border-radius: 12px;
        box-shadow: var(--card-shadow);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .chart-panel h3 {
        margin-top: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        text-align: center;
      }
      .canvas-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 450px;
        width: 100%;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
      .evolution-panel {
        margin-top: 40px;
        background: var(--card-bg);
        padding: 30px;
        border-radius: 12px;
        box-shadow: var(--card-shadow);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }
      .panel-header h3 {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        text-transform: uppercase;
      }
      .skill-select {
        background: #1a1f26;
        color: white;
        border: 1px solid #444;
        padding: 8px 15px;
        border-radius: 4px;
        outline: none;
        font-family: 'Saira Semi Condensed', sans-serif;
      }
      .line-canvas-wrapper {
        height: 300px;
        width: 100%;
      }
    `,
  ],
})
export class PlayerDetailComponent implements OnInit {
  @ViewChild('radarChart') radarChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  player = signal<any>(null);
  selectedVersion = signal<number | null>(null);
  selectedSkill: string = 'pace';
  error404 = signal<boolean>(false);
  chart: any;
  lineChart: any;

  versions = computed(() => {
    const p = this.player();
    if (!p || !p.skills) return [];
    return [...p.skills].sort(
      (a: any, b: any) => a.fifaVersion - b.fifaVersion,
    );
  });

  constructor(
    private route: ActivatedRoute,
    private playersService: PlayersService,
  ) {}

  onImageError(event: any, type: 'nation' | 'club' | 'player'): void {
    if (type === 'player') {
      event.target.src = 'https://cdn.sofifa.net/players/notfound_0_120.png';
    } else {
      event.target.style.display = 'none';
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.playersService.getPlayer(+id).subscribe({
        next: (player) => {
          this.player.set(player);
          this.selectedSkill = player.position === 'GK' ? 'gkDiving' : 'pace';
          if (player.skills && player.skills.length > 0) {
            const latest = [...player.skills].sort(
              (a: any, b: any) => b.fifaVersion - a.fifaVersion,
            )[0];
            this.selectedVersion.set(latest.fifaVersion);
            setTimeout(() => {
              this.updateChart();
              this.loadSkillTimeline();
            }, 100);
          }
        },
        error: (err) => {
          if (err.status === 404) {
            this.error404.set(true);
          }
        },
      });
    }
  }

  loadSkillTimeline(): void {
    const p = this.player();
    if (!p) return;
    this.playersService
      .getSkillTimeline(p.id, this.selectedSkill)
      .subscribe((history) => {
        this.renderLineChart(history);
      });
  }

  renderLineChart(history: { version: number; value: number }[]): void {
    if (!this.lineChartCanvas) return;
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = history.map((h) => `FIFA ${h.version}`);
    const values = history.map((h) => h.value);
    const borderColor =
      this.player().gender === 'female' ? '#ffb6c1' : '#87ceeb';

    if (this.lineChart) {
      this.lineChart.data.labels = labels;
      this.lineChart.data.datasets[0].data = values;
      this.lineChart.update();
    } else {
      this.lineChart = new Chart(ctx as any, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: this.selectedSkill.toUpperCase(),
              data: values,
              borderColor: borderColor,
              backgroundColor: borderColor + '33',
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: borderColor,
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 10,
              displayColors: false,
            },
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#888' },
            },
            x: { grid: { display: false }, ticks: { color: '#888' } },
          },
        },
      });
    }
  }

  selectVersion(version: number): void {
    this.selectedVersion.set(version);
    this.updateChart();
  }

  updateChart(): void {
    const p = this.player();
    const version = this.selectedVersion();
    if (!p || !p.skills || !version) return;

    const skill = p.skills.find((s: any) => s.fifaVersion === version);
    if (!skill) return;

    const isGk = p.position === 'GK';
    const labels = isGk
      ? ['DIV', 'HAN', 'PAT', 'REF', 'VEL', 'POS']
      : ['RIT', 'TIRO', 'PAS', 'REG', 'DEF', 'FIS'];
    const data = isGk
      ? [
          skill.gkDiving,
          skill.gkHandling,
          skill.gkKicking,
          skill.gkReflexes,
          skill.gkSpeed,
          skill.gkPositioning,
        ].map(Number)
      : [
          skill.pace,
          skill.shooting,
          skill.passing,
          skill.dribbling,
          skill.defending,
          skill.physical,
        ].map(Number);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    } else {
      this.initChart(data, labels);
    }
  }

  initChart(data: number[], labels: string[]): void {
    if (!this.radarChartCanvas) return;
    const ctx = this.radarChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const p = this.player();
    let borderColor = 'rgb(135, 206, 235)';
    let bgColor = 'rgba(135, 206, 235, 0.4)';

    if (p.overallRating >= 90) {
      borderColor = '#ffd700';
      bgColor = 'rgba(255, 215, 0, 0.4)';
    } else if (p.gender === 'female') {
      borderColor = '#ffb6c1';
      bgColor = 'rgba(255, 182, 193, 0.4)';
    }

    this.chart = new Chart(ctx as any, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Atributos',
            data: data,
            fill: true,
            backgroundColor: bgColor,
            borderColor: borderColor,
            pointBackgroundColor: borderColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: borderColor,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: "'Saira Semi Condensed', sans-serif",
              size: 16,
            },
            bodyFont: {
              family: "'Saira Semi Condensed', sans-serif",
              size: 14,
            },
            padding: 10,
            displayColors: false,
          },
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
            grid: { color: 'rgba(255, 255, 255, 0.2)' },
            pointLabels: {
              color: '#fff',
              font: {
                size: 14,
                family: "'Saira Semi Condensed', sans-serif",
                weight: 'bold',
              },
            },
            min: 0,
            max: 100,
            ticks: { display: false, stepSize: 20 },
          },
        },
      },
    });
  }
}
