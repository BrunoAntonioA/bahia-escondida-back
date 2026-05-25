import { Product } from './products.models';
import { Sale } from './sales.models';

export class BaseClient {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export class Client extends BaseClient {
  id: number;
}

export class ClientWithSales extends Client {
  sales: Sale[];
}

export class ClientWithProducts extends Client {
  products: Product[];
}
