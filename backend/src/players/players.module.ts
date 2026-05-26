import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { ImportService } from './import.service';
import { Player } from './entities/player.entity';
import { PlayerSkill } from './entities/player-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerSkill])],
  controllers: [PlayersController],
  providers: [PlayersService, ImportService],
})
export class PlayersModule {}
