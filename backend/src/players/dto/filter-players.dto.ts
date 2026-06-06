import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterPlayersDto {
  @ApiProperty({ required: false, description: 'Filter by player name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Filter by club name' })
  @IsOptional()
  @IsString()
  club?: string;

  @ApiProperty({ required: false, description: 'Filter by position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false, description: 'Filter by nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ required: false, description: 'Filter by FIFA version' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fifaVersion?: number;

  @ApiProperty({ required: false, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Items per page (max 100)',
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Export all, disables pagination' })
  @IsOptional()
  @Type(() => Boolean)
  export?: boolean;
}
