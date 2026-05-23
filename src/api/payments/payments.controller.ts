import { Body, Controller, Post } from '@nestjs/common';
import { CurrentClientId } from 'src/api/auth/decorators/current-client-id.decorator';
import { PaymentsService } from 'src/services/payments/payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment(
    @CurrentClientId() clientId: number,
    @Body()
    body: {
      cardPaid: number;
      cashPaid: number;
      transferPaid: number;
      tipPaid: number;
      saleId: number;
    },
  ) {
    const { cardPaid, cashPaid, transferPaid, tipPaid, saleId } = body;
    return this.paymentsService.create(
      clientId,
      cashPaid,
      cardPaid,
      transferPaid,
      tipPaid,
      saleId,
    );
  }
}
