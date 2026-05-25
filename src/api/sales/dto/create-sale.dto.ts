import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isDelivery: boolean;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  tableNumber?: number;

  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
  customerNickname?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  partySize?: number;
}
