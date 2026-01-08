import { Injectable } from '@nestjs/common';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';

interface DbSchema {
  sales: any[];
  products: any[];
  saleProducts: any[];
}

@Injectable()
export class DbLowService {
  private db: low.LowdbSync<DbSchema>;

  constructor() {
    const adapter = new FileSync<DbSchema>('db.json');
    this.db = low(adapter);

    this.db.defaults({ products: [], sales: [], saleProducts: [] }).write();
  }

  read() {
    return this.db.getState();
  }

  get data() {
    return this.db.getState();
  }

  write() {
    this.db.write();
  }

  async findByFilter(value: any, key: string, collection: keyof DbSchema) {
    return this.getCollection(collection)
      .filter({ [key]: value })
      .value();
  }

  getCollection<K extends keyof DbSchema>(name: K) {
    return this.db.get(name);
  }
}
