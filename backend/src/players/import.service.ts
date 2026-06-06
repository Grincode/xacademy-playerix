import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Player } from './entities/player.entity';
import { PlayerSkill } from './entities/player-skill.entity';
import { createReadStream, unlinkSync } from 'fs';
import * as Papa from 'papaparse';

export interface ImportStats {
  created: number;
  updated: number;
  errors: number;
}

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(PlayerSkill)
    private readonly skillRepository: Repository<PlayerSkill>,
  ) {}

  async importCsv(filePath: string): Promise<ImportStats> {
    const stats: ImportStats = { created: 0, updated: 0, errors: 0 };
    const stream = createReadStream(filePath);

    return new Promise((resolve, reject) => {
      let headers: string[] = [];
      let idx: Record<string, number> = {};
      let rowIndex = 0;
      let batch: any[][] = [];
      const BATCH_SIZE = 200;

      Papa.parse(stream, {
        header: false,
        skipEmptyLines: 'greedy',
        dynamicTyping: true,
        delimiter: ',',
        step: (result, parser) => {
          if (rowIndex === 0) {
            headers = (result.data as string[]).map((h: any) =>
              String(h)
                .toLowerCase()
                .trim()
                .replace(/^\uFEFF/, ''),
            );
            idx = buildColumnIndex(headers);
            rowIndex++;
            return;
          }

          batch.push(result.data as any[]);
          rowIndex++;

          if (batch.length >= BATCH_SIZE) {
            parser.pause();
            this.processBatch(batch, idx, stats)
              .then(() => {
                batch = [];
                parser.resume();
              })
              .catch(reject);
          }
        },
        complete: async () => {
          try {
            if (batch.length > 0) await this.processBatch(batch, idx, stats);
          } finally {
            cleanup(filePath);
          }
          resolve(stats);
        },
        error: (err) => {
          cleanup(filePath);
          reject(err);
        },
      });
    });
  }

  private async processBatch(
    rows: any[][],
    idx: Record<string, number>,
    stats: ImportStats,
  ) {
    const playerCache = new Map<string, Player>();
    const wasNew = new Map<string, boolean>();
    const playerRowKeys: { row: any[]; cacheKey: string }[] = [];

    for (const row of rows) {
      try {
        const name = row[idx.shortName];
        if (!name) continue;

        const externalId = idx.playerId !== -1 ? row[idx.playerId] : null;
        const club = idx.club !== -1 ? (row[idx.club] ?? 'Sin Club') : 'Sin Club';
        const cacheKey = externalId ? `e:${externalId}` : `n:${name}|c:${club}`;

        if (!playerCache.has(cacheKey)) {
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
              idx.nationality !== -1
                ? (row[idx.nationality] ?? 'Desconocida')
                : 'Desconocida',
            club,
            position: idx.positions !== -1 ? (row[idx.positions] ?? 'N/A') : 'N/A',
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
            wasNew.set(cacheKey, false);
          } else {
            player = this.playerRepository.create(playerData);
            wasNew.set(cacheKey, true);
          }
          playerCache.set(cacheKey, player);
        }

        playerRowKeys.push({ row, cacheKey });
      } catch (err) {
        console.error('Error processing row:', row, err);
        stats.errors++;
      }
    }

    if (playerCache.size === 0) return;

    try {
      const playersArray = [...playerCache.values()];
      const savedPlayers = await this.playerRepository.save(playersArray);

      for (const [, isNew] of wasNew) {
        if (isNew) stats.created++;
        else stats.updated++;
      }

      const playerIdByKey = new Map<string, number>();
      for (let i = 0; i < savedPlayers.length; i++) {
        for (const [key, p] of playerCache) {
          if (p === playersArray[i]) {
            playerIdByKey.set(key, savedPlayers[i].id);
            break;
          }
        }
      }

      const latestSkillData = new Map<
        string,
        { playerId: number; fifaVersion: number; skillData: any }
      >();

      for (const { row, cacheKey } of playerRowKeys) {
        const playerId = playerIdByKey.get(cacheKey);
        if (!playerId) continue;

        const fifaVersion = idx.fifaVersion !== -1 ? row[idx.fifaVersion] : 24;
        const skillKey = `${playerId}::v${fifaVersion}`;

        latestSkillData.set(skillKey, {
          playerId,
          fifaVersion,
          skillData: {
            playerId,
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
          },
        });
      }

      if (latestSkillData.size === 0) return;

      const allPlayerIds = [...new Set(playerIdByKey.values())] as number[];
      const existingSkills = await this.skillRepository.find({
        where: { playerId: In(allPlayerIds) },
      });

      const skillMap = new Map<string, PlayerSkill>();
      for (const s of existingSkills) {
        skillMap.set(`${s.playerId}::v${s.fifaVersion}`, s);
      }

      const skillsToSave: PlayerSkill[] = [];
      for (const { playerId, fifaVersion, skillData } of latestSkillData.values()) {
        const skillKey = `${playerId}::v${fifaVersion}`;
        const existing = skillMap.get(skillKey);

        if (existing) {
          Object.assign(existing, skillData);
          skillsToSave.push(existing);
        } else {
          const skill = new PlayerSkill();
          Object.assign(skill, skillData);
          skillsToSave.push(skill);
        }
      }

      if (skillsToSave.length > 0) {
        await this.skillRepository.save(skillsToSave);
      }
    } catch (err) {
      console.error('Batch save failed, retrying row by row:', err);
      for (const row of rows) {
        try {
          const name = row[idx.shortName];
          if (!name) continue;

          const externalId = idx.playerId !== -1 ? row[idx.playerId] : null;
          const club = idx.club !== -1 ? (row[idx.club] ?? 'Sin Club') : 'Sin Club';

          let player: Player | null = null;
          if (externalId) {
            player = await this.playerRepository.findOneBy({ externalId });
          }
          if (!player) {
            player = await this.playerRepository.findOneBy({ name, club });
          }

          const playerData = {
            externalId, name,
            longName: idx.longName !== -1 ? row[idx.longName] : null,
            nationality: idx.nationality !== -1 ? (row[idx.nationality] ?? 'Desconocida') : 'Desconocida',
            club,
            position: idx.positions !== -1 ? (row[idx.positions] ?? 'N/A') : 'N/A',
            overallRating: idx.overall !== -1 ? row[idx.overall] : 0,
            nationalityId: idx.nationalityId !== -1 ? row[idx.nationalityId] : null,
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
            const created = this.playerRepository.create(playerData);
            await this.playerRepository.save(created);
            stats.created++;
          }

          const fifaVersion = idx.fifaVersion !== -1 ? row[idx.fifaVersion] : 24;
          let skill = await this.skillRepository.findOneBy({
            playerId: player!.id,
            fifaVersion,
          });

          const skillData = {
            playerId: player!.id, fifaVersion,
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
            skill = new PlayerSkill();
            Object.assign(skill, skillData);
          }
          await this.skillRepository.save(skill);
        } catch (err2) {
          console.error('Row import error:', row, err2);
          stats.errors++;
        }
      }
    }
  }
}

function buildColumnIndex(headers: string[]): Record<string, number> {
  return {
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
}

function cleanup(filePath: string) {
  try {
    unlinkSync(filePath);
  } catch {
    // ignore cleanup errors
  }
}
