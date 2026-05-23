export class SaleProductLine {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  clientId?: number;
}

export class Sale {
  id: number;
  clientId: number;
  isDelivery: boolean;
  tableNumber?: number;
  customerNickname?: string;
  partySize?: number;
  status: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  products?: SaleProductLine[];
}

export class SaleProductEntry {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
}
