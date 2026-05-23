export enum ProductCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
}

export class ProductOption {
  id: number;
  productId: number;
  name: string;
  price: number;
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
  updatedAt: Date;
  options: ProductOption[];
}
