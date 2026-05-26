import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { PlayerSkill } from './player-skill.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  externalId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  longName: string;

  @Column({ length: 10 })
  position: string;

  @Column({ length: 100, nullable: true })
  nationName: string;

  @Column({ length: 10, nullable: true })
  nationTeamId: string;

  @Column({ length: 100, nullable: true })
  clubName: string;

  @Column({ nullable: true })
  clubTeamId: number;

  @Column()
  overallRating: number;

  @Column({ nullable: true })
  potential: number;

  @Column()
  age: number;

  @Column({ length: 500, nullable: true })
  playerFaceUrl: string;

  @Column({ length: 10, default: 'male' })
  gender: string;

  @OneToOne(() => PlayerSkill, (skill) => skill.player, { cascade: true })
  skill: PlayerSkill;
}
