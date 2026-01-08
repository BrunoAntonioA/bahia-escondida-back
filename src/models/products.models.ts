export class BaseProduct {
  clientId: string;
  name: string;
  price: number;
  category: string;
}

export class Product extends BaseProduct {
  id: number;
}
