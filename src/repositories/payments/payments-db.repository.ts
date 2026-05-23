import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Payment } from 'src/models/payments.models';
import { decimalToNumber } from 'src/shared/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class PaymentsDBRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    clientId: number,
    data: {
      saleId: number;
      cashPaid: number;
      cardPaid: number;
      transferPaid: number;
      tipPaid: number;
    },
    tx: PrismaService = this.prismaService,
  ): Promise<Payment | null> {
    const sale = await tx.sale.findFirst({
      where: { id: data.saleId, clientId },
    });

    if (!sale) {
      return null;
    }

    const payment = await tx.payment.create({
      data: {
        saleId: data.saleId,
        cashPaid: data.cashPaid,
        cardPaid: data.cardPaid,
        transferPaid: data.transferPaid,
        tipPaid: data.tipPaid,
      },
    });

    return plainToInstance(Payment, {
      ...payment,
      cashPaid: decimalToNumber(payment.cashPaid),
      cardPaid: decimalToNumber(payment.cardPaid),
      transferPaid: decimalToNumber(payment.transferPaid),
      tipPaid: decimalToNumber(payment.tipPaid),
    });
  }
}
