import { Module } from '@nestjs/common';
import { ProductsModule } from './api/products/products.module';
import { ProductsService } from './services/products/products.service';
import { DbLowService } from './services/db-low/db-low.service';
import { SalesController } from './api/sales/sales.controller';
import { SalesService } from './services/sales/sales.service';

@Module({
  imports: [ProductsModule],
  providers: [ProductsService, SalesService, DbLowService],
  controllers: [SalesController],
})
export class AppModule {}
