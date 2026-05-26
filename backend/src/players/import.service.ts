import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { PlayerSkill } from './entities/player-skill.entity';
import * as Papa from 'papaparse';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(PlayerSkill)
    private readonly skillRepository: Repository<PlayerSkill>,
  ) {}

  async importCsv(fileContent: string) {
    const parsed = Papa.parse(fileContent, {
      header: false,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      delimiter: ',',
    });

    const rows = parsed.data as any[];
    if (rows.length < 2) return { created: 0, updated: 0, errors: 0 };

    const headers = rows[0].map((h: any) =>
      String(h)
        .toLowerCase()
        .trim()
        .replace(/^\uFEFF/, ''),
    );
    const dataRows = rows.slice(1);

    const stats = { created: 0, updated: 0, errors: 0 };

    // Mapeo de índices de columnas
    const idx = {
      playerId: headers.indexOf('player_id'),
      shortName:
        headers.indexOf('short_name') !== -1
          ? headers.indexOf('short_name')
          : headers.indexOf('name'),
      longName: headers.indexOf('long_name'),
      nationality:
        headers.indexOf('nationality_name') !== -1
          ? headers.indexOf('nationality_name')
          : headers.indexOf('nationality'),
      club:
        headers.indexOf('club_name') !== -1
          ? headers.indexOf('club_name')
          : headers.indexOf('club'),
      positions:
        headers.indexOf('player_positions') !== -1
          ? headers.indexOf('player_positions')
          : headers.indexOf('position'),
      overall:
        headers.indexOf('overall') !== -1
          ? headers.indexOf('overall')
          : headers.indexOf('overall_rating'),
      nationalityId: headers.indexOf('nationality_id'),
      clubId: headers.indexOf('club_team_id'),
      potential: headers.indexOf('potential'),
      age: headers.indexOf('age'),
      gender: headers.indexOf('gender'),
      faceUrl:
        headers.indexOf('player_face_url') !== -1
          ? headers.indexOf('player_face_url')
          : headers.indexOf('face_url'),
      fifaVersion: headers.indexOf('fifa_version'),
      pace: headers.indexOf('pace'),
      shooting: headers.indexOf('shooting'),
      passing: headers.indexOf('passing'),
      dribbling: headers.indexOf('dribbling'),
      defending: headers.indexOf('defending'),
      physical:
        headers.indexOf('physic') !== -1
          ? headers.indexOf('physic')
          : headers.indexOf('physical'),
      div: headers.indexOf('goalkeeping_diving'),
      han: headers.indexOf('goalkeeping_handling'),
      kic: headers.indexOf('goalkeeping_kicking'),
      pos: headers.indexOf('goalkeeping_positioning'),
      ref: headers.indexOf('goalkeeping_reflexes'),
      spd: headers.indexOf('goalkeeping_speed'),
    };

    for (const row of dataRows) {
      try {
        const name = row[idx.shortName];
        if (!name) continue;

        const externalId = idx.playerId !== -1 ? row[idx.playerId] : null;
        const club = idx.club !== -1 ? row[idx.club] : 'Sin Club';

        // Buscar si existe por externalId, luego por nombre+club
        let player: Player | null = null;
        if (externalId) {
          player = await this.playerRepository.findOneBy({ externalId });
        }
        if (!player) {
          player = await this.playerRepository.findOneBy({ name, club });
        }

        const playerData = {
          externalId,
          name,
          longName: idx.longName !== -1 ? row[idx.longName] : null,
          nationality:
            idx.nationality !== -1 ? row[idx.nationality] : 'Desconocida',
          club,
          position: idx.positions !== -1 ? row[idx.positions] : 'N/A',
          overallRating: idx.overall !== -1 ? row[idx.overall] : 0,
          nationalityId:
            idx.nationalityId !== -1 ? row[idx.nationalityId] : null,
          clubTeamId: idx.clubId !== -1 ? row[idx.clubId] : null,
          potential: idx.potential !== -1 ? row[idx.potential] : null,
          age: idx.age !== -1 ? row[idx.age] : 0,
          gender: idx.gender !== -1 ? row[idx.gender] : 'male',
          playerFaceUrl: idx.faceUrl !== -1 ? row[idx.faceUrl] : null,
        };

        if (player) {
          Object.assign(player, playerData);
          await this.playerRepository.save(player);
          stats.updated++;
        } else {
          player = this.playerRepository.create(playerData);
          await this.playerRepository.save(player);
          stats.created++;
        }

        // Skills por versión de FIFA
        const fifaVersion = idx.fifaVersion !== -1 ? row[idx.fifaVersion] : 24;
        let skill = await this.skillRepository.findOneBy({
          playerId: player.id,
          fifaVersion,
        });

        const skillData = {
          playerId: player.id,
          fifaVersion,
          pace: idx.pace !== -1 ? Number(row[idx.pace] || 0) : 0,
          shooting: idx.shooting !== -1 ? Number(row[idx.shooting] || 0) : 0,
          passing: idx.passing !== -1 ? Number(row[idx.passing] || 0) : 0,
          dribbling: idx.dribbling !== -1 ? Number(row[idx.dribbling] || 0) : 0,
          defending: idx.defending !== -1 ? Number(row[idx.defending] || 0) : 0,
          physical: idx.physical !== -1 ? Number(row[idx.physical] || 0) : 0,
          gkDiving: idx.div !== -1 ? Number(row[idx.div] || 0) : 0,
          gkHandling: idx.han !== -1 ? Number(row[idx.han] || 0) : 0,
          gkKicking: idx.kic !== -1 ? Number(row[idx.kic] || 0) : 0,
          gkPositioning: idx.pos !== -1 ? Number(row[idx.pos] || 0) : 0,
          gkReflexes: idx.ref !== -1 ? Number(row[idx.ref] || 0) : 0,
          gkSpeed: idx.spd !== -1 ? Number(row[idx.spd] || 0) : 0,
        };

        if (skill) {
          Object.assign(skill, skillData);
        } else {
          skill = this.skillRepository.create(skillData);
        }
        await this.skillRepository.save(skill);
      } catch (err) {
        console.error('Error importing row:', row, err);
        stats.errors++;
      }
    }

    return stats;
  }
}
