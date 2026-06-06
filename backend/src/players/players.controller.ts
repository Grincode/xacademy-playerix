import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { ImportService } from './import.service';
import { FilterPlayersDto } from './dto/filter-players.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('players')
@ApiBearerAuth()
@Controller('players')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly importService: ImportService,
  ) {}

  @Post('import')
  @Roles('admin')
  @ApiOperation({ summary: 'Import players and skills from CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new NotFoundException('No file uploaded');
    return this.importService.importCsv(file.buffer.toString());
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new player' })
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated and filtered players list' })
  findAll(@Query() filterDto: FilterPlayersDto) {
    return this.playersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player details by ID with skills history' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const player = await this.playersService.findOne(id);
    if (!player) throw new NotFoundException(`Player with ID ${id} not found`);
    return player;
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update player basic info' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    const player = await this.playersService.update(id, updatePlayerDto);
    if (!player) throw new NotFoundException(`Player with ID ${id} not found`);
    return player;
  }

  @Patch(':id/skills/:version')
  @Roles('admin')
  @ApiOperation({ summary: 'Update player skills for a specific FIFA version' })
  async updateSkills(
    @Param('id', ParseIntPipe) id: number,
    @Param('version', ParseIntPipe) version: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    const skill = await this.playersService.updateSkills(
      id,
      version,
      updateSkillDto,
    );
    if (!skill)
      throw new NotFoundException(
        `Skills for Player ID ${id} and Version ${version} not found`,
      );
    return skill;
  }

  @Get(':id/skill/:skillName/timeline')
  @ApiOperation({ summary: 'Get historical evolution of a specific skill' })
  async getSkillTimeline(
    @Param('id', ParseIntPipe) id: number,
    @Param('skillName') skillName: string,
  ) {
    const player = await this.playersService.findOne(id);
    if (!player) throw new NotFoundException(`Player with ID ${id} not found`);
    return this.playersService.getSkillTimeline(id, skillName);
  }
}
