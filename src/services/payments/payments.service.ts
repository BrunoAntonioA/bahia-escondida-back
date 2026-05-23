import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment } from 'src/models/payments.models';
import { PaymentsDBRepository } from 'src/repositories/payments/payments-db.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsDBRepository) {}

  public async create(
    clientId: number,
    cashPaid: number,
    cardPaid: number,
    transferPaid: number,
    tipPaid: number,
    saleId: number,
  ): Promise<Payment> {
    const payment = await this.paymentsRepository.create(clientId, {
      saleId,
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
    });

    if (!payment) {
      throw new NotFoundException('Sale not found');
    }

    return payment;
  }
}
