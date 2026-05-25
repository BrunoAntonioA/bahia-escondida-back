import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  cashPaid: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  cardPaid: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  transferPaid: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  tipPaid: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  saleId: number;
}
