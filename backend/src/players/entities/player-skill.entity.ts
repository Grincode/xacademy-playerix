import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class PlayerSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  pace: number;

  @Column({ default: 0 })
  shooting: number;

  @Column({ default: 0 })
  passing: number;

  @Column({ default: 0 })
  dribbling: number;

  @Column({ default: 0 })
  defending: number;

  @Column({ default: 0 })
  physical: number;

  @Column({ name: 'goalkeeping_diving', default: 0 })
  goalkeepingDiving: number;

  @Column({ name: 'goalkeeping_handling', default: 0 })
  goalkeepingHandling: number;

  @Column({ name: 'goalkeeping_kicking', default: 0 })
  goalkeepingKicking: number;

  @Column({ name: 'goalkeeping_reflexes', default: 0 })
  goalkeepingReflexes: number;

  @Column({ name: 'goalkeeping_speed', default: 0 })
  goalkeepingSpeed: number;

  @Column({ name: 'goalkeeping_positioning', default: 0 })
  goalkeepingPositioning: number;

  @OneToOne(() => Player)
  @JoinColumn()
  player: Player;
}
