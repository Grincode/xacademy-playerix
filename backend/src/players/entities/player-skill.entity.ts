import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('player_skills')
export class PlayerSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'fifa_version' })
  fifaVersion: number;

  @Column()
  pace: number;

  @Column()
  shooting: number;

  @Column()
  passing: number;

  @Column()
  dribbling: number;

  @Column()
  defending: number;

  @Column()
  physical: number;

  // GK specific stats
  @Column({ name: 'gk_diving', default: 0 })
  gkDiving: number;

  @Column({ name: 'gk_handling', default: 0 })
  gkHandling: number;

  @Column({ name: 'gk_kicking', default: 0 })
  gkKicking: number;

  @Column({ name: 'gk_positioning', default: 0 })
  gkPositioning: number;

  @Column({ name: 'gk_reflexes', default: 0 })
  gkReflexes: number;

  @Column({ name: 'gk_speed', default: 0 })
  gkSpeed: number;

  @ManyToOne(() => Player, (player) => player.skills)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}
