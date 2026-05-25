import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentClientId } from 'src/api/auth/decorators/current-client-id.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentDto } from 'src/swagger/schemas/payment.schema';

@ApiTags('payments')
@ApiBearerAuth('bearer')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a payment for a sale' })
  @ApiCreatedResponse({ type: PaymentDto })
  createPayment(
    @CurrentClientId() clientId: number,
    @Body() body: CreatePaymentDto,
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
