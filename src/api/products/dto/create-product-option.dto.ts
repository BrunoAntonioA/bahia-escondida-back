import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductOptionDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
