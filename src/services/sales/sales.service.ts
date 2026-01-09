import { Injectable } from '@nestjs/common';
import { DbLowService } from '../db-low/db-low.service';
import { BaseSale } from 'src/models/sales.models';

@Injectable()
export class SalesService {
  constructor(private readonly db: DbLowService) {}

  findAll() {
    const state = this.db.read();
    return state.sales;
  }

  create(sale: BaseSale) {
    const newSale = {
      id: Date.now(),
      createdAt: new Date(),
      ...sale,
    };

    const state = this.db.read();
    state.sales.push(newSale);
    this.db.save(state);

    return newSale;
  }

  getSaleById(saleId: number) {
    const state = this.db.read();

    const sale = state.sales.find((s) => s.id === Number(saleId));

    if (!sale) return null;

    const saleProducts = state.saleProducts.filter(
      (sp) => sp.saleId === Number(saleId),
    );

    const products = saleProducts
      .map((sp) => {
        const product = state.products.find((p) => p.id === sp.productId);

        if (!product) return null;

        return {
          ...product,
          quantity: sp.quantity,
        };
      })
      .filter(Boolean);

    return {
      ...sale,
      products,
    };
  }

  addProductToSale(saleId: number, productId: number, quantity: number) {
    const state = this.db.read();

    const productExists = state.products.some(
      (p) => p.id === Number(productId),
    );

    if (!productExists) {
      throw new Error('Product does not exist');
    }

    const existingSaleProduct = state.saleProducts.find(
      (sp) =>
        sp.saleId === Number(saleId) && sp.productId === Number(productId),
    );

    if (!existingSaleProduct) {
      const newSaleProduct = {
        id: Date.now(),
        saleId: Number(saleId),
        productId: Number(productId),
        quantity: Number(quantity),
      };

      state.saleProducts.push(newSaleProduct);
      this.db.save(state);

      return newSaleProduct;
    }

    existingSaleProduct.quantity += Number(quantity);
    this.db.save(state);
  }

  closeSale(saleId: number) {
    const state = this.db.read();

    const sale = state.sales.find((s) => s.id === Number(saleId));

    if (!sale) return null;

    sale.status = 'cerrada';
    sale.closedAt = new Date();

    this.db.save(state);

    return sale;
  }

  deleteSale(saleId: number) {
    const state = this.db.read();

    state.sales = state.sales.filter((s) => s.id !== Number(saleId));

    state.saleProducts = state.saleProducts.filter(
      (sp) => sp.saleId !== Number(saleId),
    );

    this.db.save(state);

    return { deletedSaleId: saleId };
  }

  getSalesByClientId(clientId: number) {
    const state = this.db.read();

    const sales = state.sales.filter((s) => s.clientId === clientId);

    return sales.map((sale) => {
      const saleProducts = state.saleProducts.filter(
        (sp) => sp.saleId === sale.id,
      );

      const products = saleProducts
        .map((sp) => {
          const product = state.products.find((p) => p.id === sp.productId);

          if (!product) return null;

          return {
            ...product,
            quantity: sp.quantity,
          };
        })
        .filter(Boolean);

      return {
        ...sale,
        products,
      };
    });
  }
}
