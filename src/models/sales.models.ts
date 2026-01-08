export class BaseSale {
  tableNumber: number;
  clientId: string;
  customerNickname?: string;
  partySize?: number;
  status: string;
  products: [];
  createdAt?: Date;
}

export class Sale extends BaseSale {
  id: number;
}
