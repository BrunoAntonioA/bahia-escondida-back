export class SaleProductOptionLine {
  id: number;
  productOptionId: number;
  optionName: string;
  price: number;
}

export class SaleProductLine {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
  category?: string;
  selectedOptions: SaleProductOptionLine[];
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
