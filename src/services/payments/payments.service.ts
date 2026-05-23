import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { matchesClientId } from 'src/shared/client-id.util';
import { DbLowService } from '../db-low/db-low.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DbLowService) {}

  create(
    clientId: number,
    cashPaid: number,
    cardPaid: number,
    transferPaid: number,
    tipPaid: number,
    saleId: number,
  ) {
    const state = this.db.read();
    const sale = state.sales.find((s) => s.id === saleId);

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (!matchesClientId(sale.clientId, clientId)) {
      throw new ForbiddenException('Sale does not belong to this client');
    }

    const newPayment = {
      id: Date.now(),
      createdAt: new Date(),
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
      saleId,
    };

    state.payments.push(newPayment);
    this.db.save(state);

    return newPayment;
  }
}
