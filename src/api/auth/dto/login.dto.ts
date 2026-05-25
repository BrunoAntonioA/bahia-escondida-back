import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'staff@restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret12345' })
  @IsString()
  @MinLength(1)
  password: string;
}
