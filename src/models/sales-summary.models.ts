import { Payment } from './payments.models';

export class SaleSummaryItem {
  isDelivery: boolean;
  tableNumber?: number;
  customerNickname?: string;
  closedAt?: Date;
  createdAt: Date;
  payments: Payment[];
}

export class PaymentTotals {
  cashPaid: number;
  cardPaid: number;
  transferPaid: number;
  tipPaid: number;
  totalPaid: number;
  paymentCount: number;
}

export class SalesPaymentSummary {
  startDate: string;
  endDate: string;
  totals: PaymentTotals;
  sales: SaleSummaryItem[];
}
