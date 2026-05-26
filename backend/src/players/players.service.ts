import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { PlayerSkill } from './entities/player-skill.entity';
import { FilterPlayersDto } from './dto/filter-players.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(PlayerSkill)
    private readonly skillRepository: Repository<PlayerSkill>,
  ) {}

  async findAll(filterDto: FilterPlayersDto) {
    const {
      name,
      club,
      position,
      nationality,
      fifaVersion,
      page = 1,
      limit = 10,
    } = filterDto;
    const query = this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.skills', 'skills');

    if (name) {
      query.andWhere(
        '(player.name LIKE :name OR player.long_name LIKE :name)',
        { name: `%${name}%` },
      );
    }
    if (club) {
      query.andWhere('player.club LIKE :club', { club: `%${club}%` });
    }
    if (nationality) {
      query.andWhere('player.nationality LIKE :nationality', {
        nationality: `%${nationality}%`,
      });
    }
    if (fifaVersion) {
      query.andWhere('skills.fifaVersion = :fifaVersion', { fifaVersion });
    }
    if (position) {
      const posMap = {
        GK: ['GK'],
        DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
        MID: ['CM', 'CDM', 'CAM', 'LM', 'RM'],
        FWD: ['ST', 'CF', 'LW', 'RW'],
      };
      if (posMap[position]) {
        const conditions = posMap[position].map(
          (_, i) => `player.position LIKE :pos${i}`,
        );
        const params = {};
        posMap[position].forEach((p, i) => (params[`pos${i}`] = `%${p}%`));
        query.andWhere(`(${conditions.join(' OR ')})`, params);
      } else {
        query.andWhere('player.position LIKE :position', {
          position: `%${position}%`,
        });
      }
    }

    query.orderBy('player.overallRating', 'DESC');
    const [players, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: players, total, page, limit };
  }

  async findOne(id: number) {
    return this.playerRepository.findOne({
      where: { id },
      relations: ['skills'],
    });
  }

  async create(createPlayerDto: CreatePlayerDto) {
    const { skills, ...playerData } = createPlayerDto;
    const player = this.playerRepository.create(playerData);
    const savedPlayer = await this.playerRepository.save(player);

    if (skills) {
      const playerSkill = this.skillRepository.create({
        pace: 0,
        shooting: 0,
        passing: 0,
        dribbling: 0,
        defending: 0,
        physical: 0,
        gkDiving: 0,
        gkHandling: 0,
        gkKicking: 0,
        gkPositioning: 0,
        gkReflexes: 0,
        gkSpeed: 0,
        ...skills,
        playerId: savedPlayer.id,
        fifaVersion: 24,
      });
      await this.skillRepository.save(playerSkill);
    }

    return this.findOne(savedPlayer.id);
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const { skills, ...playerData } = updatePlayerDto;
    const player = await this.playerRepository.preload({ id, ...playerData });

    if (!player) return null;

    await this.playerRepository.save(player);

    if (skills) {
      const existingSkill = await this.skillRepository.findOne({
        where: { playerId: id, fifaVersion: 24 },
      });
      if (existingSkill) {
        Object.assign(existingSkill, skills);
        await this.skillRepository.save(existingSkill);
      } else {
        const newSkill = this.skillRepository.create({
          pace: 0,
          shooting: 0,
          passing: 0,
          dribbling: 0,
          defending: 0,
          physical: 0,
          gkDiving: 0,
          gkHandling: 0,
          gkKicking: 0,
          gkPositioning: 0,
          gkReflexes: 0,
          gkSpeed: 0,
          ...skills,
          playerId: player.id,
          fifaVersion: 24,
        });
        await this.skillRepository.save(newSkill);
      }
    }

    return this.findOne(player.id);
  }

  async updateSkills(
    playerId: number,
    fifaVersion: number,
    updateSkillDto: UpdateSkillDto,
  ) {
    const skill = await this.skillRepository.findOne({
      where: { playerId, fifaVersion },
    });
    if (!skill) return null;
    Object.assign(skill, updateSkillDto);
    return this.skillRepository.save(skill);
  }

  async getSkillTimeline(playerId: number, skillName: string) {
    const skills = await this.skillRepository.find({
      where: { playerId },
      order: { fifaVersion: 'ASC' },
    });
    return skills.map((s) => ({
      version: s.fifaVersion,
      value: (s as any)[skillName] ?? 0,
    }));
  }
}
