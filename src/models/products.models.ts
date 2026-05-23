export enum ProductCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
}

export class BaseProduct {
  clientId: number;
  name: string;
  price: number;
  category: ProductCategory;
}

export class Product extends BaseProduct {
  id: number;
  createdAt: Date;
  updatedAt?: Date;
}
