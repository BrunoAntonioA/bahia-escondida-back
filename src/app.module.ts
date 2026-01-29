import { Module } from '@nestjs/common';
import { ProductsModule } from './api/products/products.module';
import { ProductsService } from './services/products/products.service';
import { DbLowService } from './services/db-low/db-low.service';
import { SalesController } from './api/sales/sales.controller';
import { SalesService } from './services/sales/sales.service';
import { PaymentsService } from './services/payments/payments.service';
import { PaymentsController } from './api/payments/payments.controller';
import { PrinterController } from './api/printer/printer/printer.controller';
import { PrinterService } from './services/printer/printer/printer.service';

@Module({
  imports: [ProductsModule],
  providers: [ProductsService, SalesService, DbLowService, PaymentsService, PrinterService],
  controllers: [SalesController, PaymentsController, PrinterController],
})
export class AppModule {}
