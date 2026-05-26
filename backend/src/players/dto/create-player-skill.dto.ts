import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerSkillDto {
  @ApiProperty({
    required: false,
    example: 70,
    description: 'Pace (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  pace?: number;

  @ApiProperty({
    required: false,
    example: 70,
    description: 'Shooting (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  shooting?: number;

  @ApiProperty({
    required: false,
    example: 70,
    description: 'Passing (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  passing?: number;

  @ApiProperty({
    required: false,
    example: 70,
    description: 'Dribbling (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  dribbling?: number;

  @ApiProperty({
    required: false,
    example: 70,
    description: 'Defending (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  defending?: number;

  @ApiProperty({
    required: false,
    example: 70,
    description: 'Physical (0-99)',
    minimum: 0,
    maximum: 99,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  physical?: number;

  // GK stats
  @ApiProperty({ required: false, example: 10, description: 'GK Diving' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  gkDiving?: number;

  @ApiProperty({ required: false, example: 10, description: 'GK Handling' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  gkHandling?: number;

  @ApiProperty({ required: false, example: 10, description: 'GK Kicking' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  gkKicking?: number;

  @ApiProperty({ required: false, example: 10, description: 'GK Positioning' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  gkPositioning?: number;

  @ApiProperty({ required: false, example: 10, description: 'GK Reflexes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  gkReflexes?: number;

  @ApiProperty({ required: false, example: 10, description: 'GK Speed' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  gkSpeed?: number;
}
