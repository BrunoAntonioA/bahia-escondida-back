import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from 'src/services/payments/payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment(@Body() body) {
    console.log('Received sale creation request: ', body);
    const { cardPaid, cashPaid, transferPaid, tipPaid, saleId } = body;
    return this.paymentsService.create(
      cardPaid,
      cashPaid,
      transferPaid,
      tipPaid,
      saleId,
    );
  }
}
