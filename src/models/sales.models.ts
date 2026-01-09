export class BaseSale {
  clientId: string;
  isDelivery: boolean;
  tableNumber?: number;
  customerNickname?: string;
  partySize?: number;
  status: string;
  products: [];
  createdAt?: Date;
}

export class Sale extends BaseSale {
  id: number;
}
