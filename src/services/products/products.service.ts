import { Injectable } from '@nestjs/common';
import { DbLowService } from '../db-low/db-low.service';
import { BaseProduct } from 'src/models/products.models';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DbLowService) {}

  findAll() {
    const state = this.db.read();
    return state.products;
  }

  create(product: BaseProduct) {
    const newProduct = {
      id: Date.now(),
      ...product,
    };

    const state = this.db.read();
    state.products.push(newProduct);
    this.db['save'](state); // internal safe write

    return newProduct;
  }

  getClientProducts(clientId: string) {
    const state = this.db.read();
    return state.products.filter((product) => product.clientId === clientId);
  }

  delete(productId: string) {
    const state = this.db.read();

    state.products = state.products.filter(
      (product) => product.id !== Number(productId),
    );

    this.db['save'](state);

    return { deletedProductId: productId };
  }
}
