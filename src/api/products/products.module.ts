import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from 'src/services/products/products.service';
import { DbLowService } from 'src/services/db-low/db-low.service';

@Module({
  imports: [],
  controllers: [ProductsController],
  providers: [
    {
      provide: DbLowService,
      useFactory: () => {
        return new DbLowService();
      },
      inject: [],
    },
    {
      provide: ProductsService,
      useFactory: (dbLowService: DbLowService) => {
        return new ProductsService(dbLowService);
      },
      inject: [DbLowService],
    },
  ],
})
export class ProductsModule {}
