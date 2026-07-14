import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123!', description: 'New password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
