import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentDto } from './payment.schema';

export class SaleSummaryItemDto {
  @ApiProperty({ example: false })
  isDelivery: boolean;

  @ApiPropertyOptional({ example: 1 })
  tableNumber?: number;

  @ApiPropertyOptional({ example: 'Carlos' })
  customerNickname?: string;

  @ApiPropertyOptional()
  closedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    type: [PaymentDto],
    description: 'Payments for this sale within the requested date range',
  })
  payments: PaymentDto[];
}

export class PaymentTotalsDto {
  @ApiProperty({ example: 50000 })
  cashPaid: number;

  @ApiProperty({ example: 120000 })
  cardPaid: number;

  @ApiProperty({ example: 0 })
  transferPaid: number;

  @ApiProperty({ example: 5000 })
  tipPaid: number;

  @ApiProperty({ example: 175000 })
  totalPaid: number;

  @ApiProperty({ example: 12 })
  paymentCount: number;
}

export class SalesPaymentSummaryDto {
  @ApiProperty({ example: '2026-05-25T00:00:00.000Z' })
  startDate: string;

  @ApiProperty({ example: '2026-05-25T23:59:59.999Z' })
  endDate: string;

  @ApiProperty({ type: PaymentTotalsDto })
  totals: PaymentTotalsDto;

  @ApiProperty({
    type: [SaleSummaryItemDto],
    description: 'Sales with their payments in the requested date range',
  })
  sales: SaleSummaryItemDto[];
}
