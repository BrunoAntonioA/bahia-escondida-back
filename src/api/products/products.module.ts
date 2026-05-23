import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from 'src/services/products/products.service';
import { ProductsDBRepository } from 'src/repositories/products/products-db.repository';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsDBRepository,
    ProductsService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
