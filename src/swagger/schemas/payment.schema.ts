import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  saleId: number;

  @ApiProperty({ example: 5000 })
  cashPaid: number;

  @ApiProperty({ example: 10000 })
  cardPaid: number;

  @ApiProperty({ example: 0 })
  transferPaid: number;

  @ApiProperty({ example: 500 })
  tipPaid: number;

  @ApiProperty()
  createdAt: Date;
}
