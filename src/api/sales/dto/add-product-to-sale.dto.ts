import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddProductToSaleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  saleId: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  productId: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Sin cebolla' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [12],
    description: 'Required when the product has configurable options',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Type(() => Number)
  selectedOptionIds?: number[];
}
