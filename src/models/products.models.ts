export enum ProductCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  options: ProductOption[];
}
