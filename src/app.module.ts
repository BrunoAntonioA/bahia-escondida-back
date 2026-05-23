import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './api/auth/guards/jwt-auth.guard';
import { ProductsModule } from './api/products/products.module';
import { ProductsService } from './services/products/products.service';
import { DbLowService } from './services/db-low/db-low.service';
import { SalesController } from './api/sales/sales.controller';
import { SalesService } from './services/sales/sales.service';
import { PaymentsService } from './services/payments/payments.service';
import { PaymentsController } from './api/payments/payments.controller';
import { ClientsModule } from './api/clients/clients.module';
import { AuthModule } from './api/auth/auth.module';

@Module({
  imports: [ProductsModule, ClientsModule, AuthModule],
  providers: [
    ProductsService,
    SalesService,
    DbLowService,
    PaymentsService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [SalesController, PaymentsController],
})
export class AppModule {}
