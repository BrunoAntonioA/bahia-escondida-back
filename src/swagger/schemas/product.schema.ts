import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory, ProductStatus } from 'src/models/products.models';

export class ProductOptionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'Burger' })
  name: string;

  @ApiProperty({ example: 0 })
  price: number;
}

export class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  clientId: number;

  @ApiProperty({ example: 'Promo 5' })
  name: string;

  @ApiProperty({ example: 15000 })
  price: number;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.FOOD })
  category: ProductCategory;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status: ProductStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ProductOptionDto] })
  options: ProductOptionDto[];
}
