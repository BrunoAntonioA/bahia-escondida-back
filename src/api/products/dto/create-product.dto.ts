import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductCategory } from 'src/models/products.models';
import { CreateProductOptionDto } from './create-product-option.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Promo 5' })
  @IsString()
  name: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.FOOD })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({
    type: [CreateProductOptionDto],
    description: 'Optional choices for combo / configurable products',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];
}
