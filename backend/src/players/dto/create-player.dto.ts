import {
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePlayerSkillDto } from './create-player-skill.dto';

export class CreatePlayerDto {
  @ApiProperty({
    required: false,
    example: 12345,
    description: 'External player ID',
  })
  @IsInt()
  @IsOptional()
  externalId?: number;

  @ApiProperty({ example: 'Lionel Messi', description: 'Player short name' })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Lionel Andrés Messi',
    description: 'Player full name',
  })
  @IsString()
  @IsOptional()
  longName?: string;

  @ApiProperty({ example: 'Argentina', description: 'Player nationality' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: 'Inter Miami', description: 'Player club' })
  @IsString()
  club: string;

  @ApiProperty({ example: 'RW', description: 'Player position' })
  @IsString()
  position: string;

  @ApiProperty({ required: false, description: 'Nationality ID' })
  @IsInt()
  @IsOptional()
  nationalityId?: number;

  @ApiProperty({ required: false, description: 'Club team ID' })
  @IsInt()
  @IsOptional()
  clubTeamId?: number;

  @ApiProperty({
    example: 93,
    description: 'Overall rating (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsInt()
  @Min(0)
  @Max(99)
  overallRating: number;

  @ApiProperty({
    required: false,
    example: 93,
    description: 'Potential rating (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(99)
  potential?: number;

  @ApiProperty({
    example: 36,
    description: 'Player age',
    minimum: 15,
    maximum: 50,
  })
  @IsInt()
  @Min(15)
  @Max(50)
  age: number;

  @ApiProperty({ required: false, description: 'Player face image URL' })
  @IsString()
  @IsOptional()
  playerFaceUrl?: string;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female'],
    description: 'Player gender',
  })
  @IsString()
  @IsIn(['male', 'female'])
  gender: string;

  @ApiProperty({ type: CreatePlayerSkillDto })
  @ValidateNested()
  @Type(() => CreatePlayerSkillDto)
  @IsOptional()
  skills?: CreatePlayerSkillDto;
}
