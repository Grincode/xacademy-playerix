import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@fifa.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'User password (min 6 chars)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
