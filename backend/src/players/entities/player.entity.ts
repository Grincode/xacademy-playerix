import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlayerSkill } from './player-skill.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'external_id', nullable: true })
  externalId: number;

  @Column()
  name: string;

  @Column({ name: 'long_name', nullable: true })
  longName: string;

  @Column()
  nationality: string;

  @Column()
  club: string;

  @Column()
  position: string;

  @Column({ name: 'nationality_id', nullable: true })
  nationalityId: number;

  @Column({ name: 'club_team_id', nullable: true })
  clubTeamId: number;

  @Column({ name: 'overall_rating' })
  overallRating: number;

  @Column({ nullable: true })
  potential: number;

  @Column()
  age: number;

  @Column({ name: 'player_face_url', nullable: true })
  playerFaceUrl: string;

  @Column({ default: 'male' })
  gender: string;

  @OneToMany(() => PlayerSkill, (skill) => skill.player)
  skills: PlayerSkill[];
}
