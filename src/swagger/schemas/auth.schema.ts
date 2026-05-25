import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class PublicUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'staff@restaurant.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Maria' })
  name?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  role: UserRole;

  @ApiPropertyOptional({
    example: 1,
    description: 'Business client id linked to this user',
  })
  clientId?: number;

  @ApiPropertyOptional({
    example: 'Bahia Escondida',
    description: 'Business client name (included in login and GET /auth/me responses)',
  })
  clientName?: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: PublicUserDto })
  user: PublicUserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;
}
