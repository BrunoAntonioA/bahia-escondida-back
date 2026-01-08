import { Injectable } from '@nestjs/common';
import { DbLowService } from '../db-low/db-low.service';
import { BaseSale } from 'src/models/sales.models';

@Injectable()
export class SalesService {
  readonly collectionName = 'sales';
  constructor(private readonly db: DbLowService) {}

  findAll() {
    return this.db.getCollection(this.collectionName).value();
  }

  create(sale: BaseSale) {
    console.log('Creating sale: ', sale);
    const newSale = {
      id: Date.now(),
      createdAt: new Date(),
      ...sale,
    };
    this.db.getCollection(this.collectionName).push(newSale).write();
    return newSale;
  }

  getSaleById(saleId: number) {
    const sale = this.db
      .getCollection(this.collectionName)
      .find({ id: Number(saleId) })
      .value();

    if (!sale) return null;

    const saleProducts = this.getSaleProducts(saleId);

    if (saleProducts) {
      const products = saleProducts.map((sp) => {
        const product = this.db
          .getCollection('products')
          .find({ id: sp.productId })
          .value();

        return {
          ...product,
          quantity: sp.quantity,
        };
      });
      sale.products = products;
    }

    return sale;
  }

  addProductToSale(saleId: number, productId: number, quantity: number) {
    const existingProduct = this.getProductById(productId);
    if (!existingProduct) {
      throw new Error('Product does not exist');
    }
    const existingSaleProduct = this.getSaleProduct(saleId, productId);
    if (!existingSaleProduct || existingSaleProduct.length === 0) {
      const newSaleProduct = {
        id: Date.now(),
        saleId,
        productId,
        quantity,
      };
      console.log('newSaleProduct to create: ', newSaleProduct);
      this.db.getCollection('saleProducts').push(newSaleProduct).write();
      return newSaleProduct;
    } else {
      this.updateSaleProductQuantity(
        existingSaleProduct[0].id,
        quantity + existingSaleProduct[0].quantity,
      );
    }
  }

  getProductById(productId: number) {
    return this.db
      .getCollection('products')
      .find({ id: Number(productId) })
      .value();
  }

  updateSaleProductQuantity(id: number, quantity: number) {
    this.db
      .getCollection('saleProducts')
      .find({ id: Number(id) })
      .assign({ quantity: Number(quantity) })
      .write();
  }

  closeSale(saleId) {
    this.db
      .getCollection('sales')
      .find({ id: Number(saleId) })
      .assign({ status: 'cerrada', closedAt: new Date() })
      .write();
  }

  getSaleProduct(saleId: number, productId: number) {
    return this.db
      .getCollection('saleProducts')
      .filter({ saleId: Number(saleId), productId: Number(productId) })
      .value();
  }

  getSaleProducts(saleId: number) {
    return this.db
      .getCollection('saleProducts')
      .filter({ saleId: Number(saleId) })
      .value();
  }

  getSalesByClientId(clientId: number) {
    const sales = this.db
      .getCollection(this.collectionName)
      .filter({ clientId: clientId })
      .value();

    for (const sale of sales) {
      const saleProducts = this.getSaleProducts(sale.id);
      if (saleProducts) {
        const products = saleProducts.map((sp) => {
          const product = this.db
            .getCollection('products')
            .find({ id: sp.productId })
            .value();

          return {
            ...product,
            quantity: sp.quantity,
          };
        });
        sale.products = products;
      }
    }

    return sales;
  }
}
