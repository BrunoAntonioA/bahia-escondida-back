import { ProductCategory } from 'src/models/products.models';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(ProductCategory)
  category: ProductCategory;
}
