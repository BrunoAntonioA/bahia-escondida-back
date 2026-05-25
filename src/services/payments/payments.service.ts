import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment } from 'src/models/payments.models';
import { PaymentsDBRepository } from 'src/repositories/payments/payments-db.repository';
import { AppLoggerService } from 'src/services/logging/app-logger.service';

const LOG_CONTEXT = 'PaymentsService';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsDBRepository,
    private readonly appLogger: AppLoggerService,
  ) {}

  public async create(
    clientId: number,
    cashPaid: number,
    cardPaid: number,
    transferPaid: number,
    tipPaid: number,
    saleId: number,
  ): Promise<Payment> {
    this.appLogger.log(LOG_CONTEXT, 'Creating payment', {
      clientId,
      saleId,
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
    });

    const payment = await this.paymentsRepository.create(clientId, {
      saleId,
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
    });

    if (!payment) {
      this.appLogger.warn(LOG_CONTEXT, 'Sale not found for payment', {
        clientId,
        saleId,
      });
      throw new NotFoundException('Sale not found');
    }

    this.appLogger.log(LOG_CONTEXT, 'Payment created', {
      clientId,
      saleId,
      paymentId: payment.id,
    });

    return payment;
  }
}
