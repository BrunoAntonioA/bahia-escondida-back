import { Injectable } from '@nestjs/common';
import { DbLowService } from '../db-low/db-low.service';
import { BaseProduct } from 'src/models/products.models';

@Injectable()
export class ProductsService {
  readonly collectionName = 'products';
  constructor(private readonly db: DbLowService) {}

  findAll() {
    return this.db.getCollection('products').value();
  }

  create(product: BaseProduct) {
    console.log('Creating product: ', product);
    const newProduct = {
      id: Date.now(),
      ...product,
    };

    this.db.getCollection('products').push(newProduct).write();

    return newProduct;
  }

  public getClientProducts(clientId: string) {
    return this.db.findByFilter(clientId, 'clientId', this.collectionName);
  }

  delete(productId: string) {
    this.db
      .getCollection(this.collectionName)
      .remove({ id: Number(productId) })
      .write();

    return { deletedProductId: productId };
  }
}
