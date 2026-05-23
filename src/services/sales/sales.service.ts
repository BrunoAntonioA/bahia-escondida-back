import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from 'src/api/sales/dto/create-sale.dto';
import { matchesClientId } from 'src/shared/client-id.util';
import { DbLowService } from '../db-low/db-low.service';

@Injectable()
export class SalesService {
  constructor(private readonly db: DbLowService) {}

  create(clientId: number, sale: CreateSaleDto) {
    const newSale = {
      id: Date.now(),
      createdAt: new Date(),
      clientId,
      status: 'abierta',
      products: [],
      ...sale,
    };

    const state = this.db.read();
    state.sales.push(newSale);
    this.db.save(state);

    return newSale;
  }

  getSaleById(clientId: number, saleId: number) {
    const sale = this.findSaleOrThrow(clientId, saleId);
    const state = this.db.read();

    const saleProducts = state.saleProducts.filter(
      (sp) => sp.saleId === saleId,
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

  addProductToSale(
    clientId: number,
    saleId: number,
    productId: number,
    quantity: number,
  ) {
    this.findSaleOrThrow(clientId, saleId);

    const state = this.db.read();

    const product = state.products.find((p) => p.id === productId);

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    if (!matchesClientId(product.clientId, clientId)) {
      throw new ForbiddenException('Product does not belong to this client');
    }

    const existingSaleProduct = state.saleProducts.find(
      (sp) => sp.saleId === saleId && sp.productId === productId,
    );

    if (!existingSaleProduct) {
      const newSaleProduct = {
        id: Date.now(),
        saleId,
        productId,
        quantity: Number(quantity),
      };

      state.saleProducts.push(newSaleProduct);
      this.db.save(state);

      return newSaleProduct;
    }

    existingSaleProduct.quantity += Number(quantity);
    this.db.save(state);

    return existingSaleProduct;
  }

  closeSale(clientId: number, saleId: number) {
    const state = this.db.read();
    const sale = this.findSaleInState(state, clientId, saleId);

    sale.status = 'cerrada';
    sale.closedAt = new Date();

    this.db.save(state);

    return sale;
  }

  deleteSale(clientId: number, saleId: number) {
    this.findSaleOrThrow(clientId, saleId);

    const state = this.db.read();

    state.sales = state.sales.filter((s) => s.id !== saleId);
    state.saleProducts = state.saleProducts.filter(
      (sp) => sp.saleId !== saleId,
    );

    this.db.save(state);

    return { deletedSaleId: saleId };
  }

  getSalesByClientId(clientId: number) {
    const state = this.db.read();

    const sales = state.sales.filter((s) =>
      matchesClientId(s.clientId, clientId),
    );

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

  deleteSaleProduct(clientId: number, saleId: number, productId: number) {
    this.findSaleOrThrow(clientId, saleId);

    const state = this.db.read();

    state.saleProducts = state.saleProducts.filter(
      (s) => !(s.saleId === saleId && s.productId === productId),
    );

    this.db.save(state);
  }

  private findSaleOrThrow(clientId: number, saleId: number) {
    const state = this.db.read();
    return this.findSaleInState(state, clientId, saleId);
  }

  private findSaleInState(state: ReturnType<DbLowService['read']>, clientId: number, saleId: number) {
    const sale = state.sales.find((s) => s.id === saleId);

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (!matchesClientId(sale.clientId, clientId)) {
      throw new ForbiddenException('Sale does not belong to this client');
    }

    return sale;
  }
}
