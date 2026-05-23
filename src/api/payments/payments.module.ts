import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentsDBRepository } from 'src/repositories/payments/payments-db.repository';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsDBRepository, PaymentsService],
})
export class PaymentsModule {}
