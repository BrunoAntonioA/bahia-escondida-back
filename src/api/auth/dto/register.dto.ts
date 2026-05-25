import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'staff@restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret12345', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, example: 'Maria' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, enum: UserRole, example: UserRole.STAFF })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Business client id the user belongs to',
  })
  @IsOptional()
  @IsInt()
  clientId?: number;
}
