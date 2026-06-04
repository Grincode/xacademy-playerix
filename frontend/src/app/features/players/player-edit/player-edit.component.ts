import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlayersService } from '../../../core/services/players.service';

@Component({
  selector: 'app-player-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <button routerLink="/players" class="btn btn-secondary">
          &larr; Cancelar
        </button>
        <h2>
          {{ isEditMode() ? 'Editar Registro' : 'Nuevo Informe de Scouting' }}
        </h2>
      </div>

      <form [formGroup]="playerForm" (ngSubmit)="onSubmit()" class="edit-form">
        <div class="form-section">
          <h3>Datos Principales</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre Corto (visible en ficha)</label>
              <input
                formControlName="name"
                class="form-control"
                placeholder="ej. Lionel Messi"
              />
            </div>
            <div class="form-group">
              <label>Nombre Completo</label>
              <input
                formControlName="longName"
                class="form-control"
                placeholder="ej. Lionel Andrés Messi"
              />
            </div>
            <div class="form-group">
              <label>Club Actual</label>
              <input
                formControlName="club"
                class="form-control"
                placeholder="ej. Inter Miami"
              />
            </div>
            <div class="form-group">
              <label>Nacionalidad</label>
              <input
                formControlName="nationality"
                class="form-control"
                placeholder="ej. Argentina"
              />
            </div>
            <div class="form-group">
              <label>Posición en Cancha</label>
              <select formControlName="position" class="form-control">
                <option value="GK">Arquero</option>
                <option value="DEF">Defensor</option>
                <option value="MID">Mediocampista</option>
                <option value="FWD">Delantero</option>
              </select>
            </div>
            <div class="form-group">
              <label>Edad</label>
              <input type="number" formControlName="age" class="form-control" />
            </div>
            <div class="form-group">
              <label>Valoración General</label>
              <input
                type="number"
                formControlName="overallRating"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Género</label>
              <select formControlName="gender" class="form-control">
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
            <div class="form-group">
              <label>URL de la Foto (Opcional)</label>
              <input
                formControlName="playerFaceUrl"
                class="form-control"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div class="form-section" formGroupName="skills">
          <h3>Atributos Técnicos</h3>
          <div
            class="form-grid"
            *ngIf="playerForm.get('position')?.value !== 'GK'"
          >
            <div class="form-group">
              <label>Ritmo (PACE)</label>
              <input
                type="number"
                formControlName="pace"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Tiro (SHO)</label>
              <input
                type="number"
                formControlName="shooting"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Pase (PAS)</label>
              <input
                type="number"
                formControlName="passing"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Regate (DRI)</label>
              <input
                type="number"
                formControlName="dribbling"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Defensa (DEF)</label>
              <input
                type="number"
                formControlName="defending"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Físico (PHY)</label>
              <input
                type="number"
                formControlName="physical"
                class="form-control"
              />
            </div>
          </div>

          <div
            class="form-grid"
            *ngIf="playerForm.get('position')?.value === 'GK'"
          >
            <div class="form-group">
              <label>Estirada (DIV)</label>
              <input
                type="number"
                formControlName="gkDiving"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Parada (HAN)</label>
              <input
                type="number"
                formControlName="gkHandling"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Saque (KIC)</label>
              <input
                type="number"
                formControlName="gkKicking"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Reflejos (REF)</label>
              <input
                type="number"
                formControlName="gkReflexes"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Velocidad (SPD)</label>
              <input
                type="number"
                formControlName="gkSpeed"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Posicionamiento (POS)</label>
              <input
                type="number"
                formControlName="gkPositioning"
                class="form-control"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
          >
            {{ isEditMode() ? 'Confirmar Cambios' : 'Registrar Jugador' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 40px 20px;
        max-width: 900px;
        margin: 0 auto;
        color: white;
        font-family: 'Saira Semi Condensed', sans-serif;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 20px;
      }
      .header h2 {
        margin: 0;
        color: var(--accent-color);
        font-size: 2rem;
        text-transform: uppercase;
      }
      .edit-form {
        background: var(--card-bg);
        padding: 40px;
        border-radius: 12px;
        box-shadow: var(--card-shadow);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .form-section h3 {
        margin-top: 0;
        font-size: 1rem;
        color: var(--text-secondary);
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 2px;
        border-left: 3px solid var(--accent-color);
        padding-left: 10px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .form-group label {
        font-size: 0.85rem;
        font-weight: bold;
        color: var(--text-secondary);
        text-transform: uppercase;
      }
      .form-control {
        background: #1a1f26;
        border: 1px solid #333;
        color: white;
        padding: 14px 15px;
        border-radius: 6px;
        outline: none;
        transition: all 0.3s;
        font-family: 'Saira Semi Condensed', sans-serif;
        font-size: 1.1rem;
      }
      .form-control:focus {
        border-color: var(--accent-color);
        box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
        background: #2a2f3a;
      }
      .form-control.ng-invalid.ng-touched {
        border-color: var(--danger);
        box-shadow: 0 0 10px rgba(220, 53, 69, 0.2);
      }
      .form-control.ng-invalid.ng-touched:focus {
        border-color: #ff6b6b;
        box-shadow: 0 0 15px rgba(220, 53, 69, 0.3);
      }
      .form-actions {
        margin-top: 40px;
        display: flex;
        justify-content: flex-end;
      }
      .btn-primary {
        padding: 15px 30px;
        font-size: 1rem;
      }
      .btn-secondary {
        background: #333;
        padding: 10px 20px;
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class PlayerEditComponent implements OnInit {
  playerForm: FormGroup;
  isEditMode = signal(false);
  playerId = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private playersService: PlayersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.playerForm = this.fb.group({
      name: ['', Validators.required],
      longName: [''],
      club: ['', Validators.required],
      nationality: ['', Validators.required],
      position: ['', Validators.required],
      age: [20, [Validators.required, Validators.min(15), Validators.max(50)]],
      overallRating: [
        75,
        [Validators.required, Validators.min(0), Validators.max(99)],
      ],
      gender: ['male', Validators.required],
      playerFaceUrl: [''],
      skills: this.fb.group({
        pace: [
          70,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        shooting: [
          70,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        passing: [
          70,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        dribbling: [
          70,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        defending: [
          70,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        physical: [
          70,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        gkDiving: [10, [Validators.min(0), Validators.max(100)]],
        gkHandling: [10, [Validators.min(0), Validators.max(100)]],
        gkKicking: [10, [Validators.min(0), Validators.max(100)]],
        gkReflexes: [10, [Validators.min(0), Validators.max(100)]],
        gkSpeed: [10, [Validators.min(0), Validators.max(100)]],
        gkPositioning: [10, [Validators.min(0), Validators.max(100)]],
      }),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.playerId.set(+id);
      this.playersService.getPlayer(+id).subscribe((player) => {
        const latestSkill =
          player.skills && player.skills.length > 0
            ? [...player.skills].sort(
                (a: any, b: any) => b.fifaVersion - a.fifaVersion,
              )[0]
            : {};
        this.playerForm.patchValue({ ...player, skills: latestSkill });
      });
    }

    this.playerForm.get('position')?.valueChanges.subscribe((pos) => {
      this.updateSkillValidators(pos);
    });
  }

  updateSkillValidators(pos: string): void {
    const skillsGroup = this.playerForm.get('skills') as FormGroup;
    const isGk = pos === 'GK';
    const fieldStats = [
      'pace',
      'shooting',
      'passing',
      'dribbling',
      'defending',
      'physical',
    ];
    const gkStats = [
      'gkDiving',
      'gkHandling',
      'gkKicking',
      'gkReflexes',
      'gkSpeed',
      'gkPositioning',
    ];

    fieldStats.forEach((s) => {
      const ctrl = skillsGroup.get(s);
      isGk
        ? ctrl?.clearValidators()
        : ctrl?.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(100),
          ]);
      ctrl?.updateValueAndValidity();
    });

    gkStats.forEach((s) => {
      const ctrl = skillsGroup.get(s);
      isGk
        ? ctrl?.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(100),
          ])
        : ctrl?.clearValidators();
      ctrl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    this.playerForm.markAllAsTouched();
    if (this.playerForm.valid) {
      const obs = this.isEditMode()
        ? this.playersService.updatePlayer(
            this.playerId()!,
            this.playerForm.value,
          )
        : this.playersService.createPlayer(this.playerForm.value);

      obs.subscribe({
        next: (res: any) => {
          alert(
            this.isEditMode()
              ? '¡Perfil actualizado!'
              : '¡Jugador creado con éxito!',
          );
          this.router.navigate(['/players', res.id || this.playerId()]);
        },
        error: () => alert('Hubo un error al procesar el scouting.'),
      });
    }
  }
}
