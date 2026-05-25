import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductOptionDto {
  @ApiProperty({ example: 'Burger' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0, description: 'Extra charge for this option (0 if included)' })
  @IsNumber()
  @Min(0)
  price: number;
}
