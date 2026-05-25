import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './api/auth/guards/jwt-auth.guard';
import { AuthModule } from './api/auth/auth.module';
import { ClientsModule } from './api/clients/clients.module';
import { PaymentsModule } from './api/payments/payments.module';
import { ProductsModule } from './api/products/products.module';
import { SalesModule } from './api/sales/sales.module';
import { LoggingModule } from './services/logging/logging.module';
import { PrismaModule } from './services/prisma/prisma.module';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

@Module({
  imports: [
    PrismaModule,
    LoggingModule,
    AuthModule,
    ClientsModule,
    ProductsModule,
    SalesModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
