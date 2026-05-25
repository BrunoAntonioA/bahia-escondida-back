import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentDto } from './payment.schema';

export class SaleProductOptionLineDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 12 })
  productOptionId: number;

  @ApiProperty({ example: 'Burger' })
  optionName: string;

  @ApiProperty({ example: 0 })
  price: number;
}

export class SaleProductLineDto {
  @ApiProperty({ example: 10, description: 'Sale line item id' })
  id: number;

  @ApiProperty({ example: 5 })
  productId: number;

  @ApiProperty({ example: 'Promo 5' })
  name: string;

  @ApiProperty({ example: 15000 })
  price: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiPropertyOptional({ example: 'Sin cebolla' })
  observation?: string;

  @ApiPropertyOptional({ example: 'FOOD' })
  category?: string;

  @ApiProperty({ type: [SaleProductOptionLineDto] })
  selectedOptions: SaleProductOptionLineDto[];
}

export class SaleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  clientId: number;

  @ApiProperty({ example: false })
  isDelivery: boolean;

  @ApiPropertyOptional({ example: 4 })
  tableNumber?: number;

  @ApiPropertyOptional({ example: 'Carlos' })
  customerNickname?: string;

  @ApiPropertyOptional({ example: 2 })
  partySize?: number;

  @ApiProperty({ example: 'abierta', enum: ['abierta', 'cerrada'] })
  status: string;

  @ApiPropertyOptional()
  closedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [SaleProductLineDto] })
  products?: SaleProductLineDto[];

  @ApiPropertyOptional({
    type: [PaymentDto],
    description: 'Payment records for this sale (cash, card, transfer, tip)',
  })
  payments?: PaymentDto[];
}

export class TableWithSalesDto {
  @ApiProperty({ example: 4 })
  tableNumber: number;

  @ApiProperty({
    type: [SaleDto],
    description: 'Sales at this table, newest first',
  })
  sales: SaleDto[];
}

export class DeletedSaleDto {
  @ApiProperty({ example: 1 })
  deletedSaleId: number;
}
