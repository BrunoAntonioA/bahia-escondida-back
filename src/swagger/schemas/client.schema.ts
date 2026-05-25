import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bahia Escondida' })
  name: string;

  @ApiPropertyOptional({ example: 'contact@bahia.com' })
  email?: string;

  @ApiPropertyOptional({ example: '+56912345678' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Costanera 123' })
  address?: string;
}
