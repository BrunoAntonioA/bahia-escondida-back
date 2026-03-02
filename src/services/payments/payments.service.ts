import { Injectable } from '@nestjs/common';
import { DbLowService } from '../db-low/db-low.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DbLowService) {}

  create(
    cashPaid: number,
    cardPaid: number,
    transferPaid: number,
    tipPaid: number,
    saleId: number,
  ) {
    const newPayment = {
      id: Date.now(),
      createdAt: new Date(),
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
      saleId,
    };

    const state = this.db.read();
    state.payments.push(newPayment);
    this.db.save(state);

    return newPayment;
  }
}
