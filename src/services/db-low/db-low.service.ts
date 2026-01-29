import { Injectable } from '@nestjs/common';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { Singleton } from 'src/shared/singleton';

interface DbSchema {
  sales: any[];
  products: any[];
  saleProducts: any[];
  payments: any[]
}
@Singleton
@Injectable()
export class DbLowService {
  private db: low.LowdbSync<DbSchema>;

  constructor() {
    const adapter = new FileSync<DbSchema>('db.json');
    this.db = low(adapter);

    // Ensure full schema exists ONCE
    const state = this.db.getState() || ({} as DbSchema);

    const safeState: DbSchema = {
      products: state.products ?? [],
      sales: state.sales ?? [],
      saleProducts: state.saleProducts ?? [],
      payments: state.payments ?? []
    };

    this.db.setState(safeState);
    this.db.write();
  }

  /** 🔒 Always read full DB */
  read(): DbSchema {
    return this.db.getState();
  }

  /** 🔒 Safe getter */
  get data(): DbSchema {
    return this.db.getState();
  }

  /** 🔒 Overwrites entire DB (safe) */
  save(state: DbSchema): void {
    this.db.setState(state);
    this.db.write();
  }

  /** ✅ Add helpers (example) */
  addProduct(product: any) {
    const state = this.read();
    state.products.push(product);
    this.save(state);
    return product;
  }

  addSale(sale: any) {
    const state = this.read();
    state.sales.push(sale);
    this.save(state);
    return sale;
  }

  addSaleProduct(saleProduct: any) {
    const state = this.read();
    state.saleProducts.push(saleProduct);
    this.save(state);
    return saleProduct;
  }

  /** 🔎 Safe filtering */
  findByFilter(value: any, key: string, collection: keyof DbSchema) {
    const state = this.read();
    return state[collection].filter((item) => item[key] === value);
  }
}
