import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from 'src/services/products/products.service';
import { DbLowService } from 'src/services/db-low/db-low.service';
import { ProductsV2Service } from 'src/services/products-v2/products-v2.service';
import { ProductsDBRepository } from 'src/repositories/products/products-db.repository';
import { PrismaService } from 'src/services/prisma/prisma.service';

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
      provide: PrismaService,
      useFactory: () => {
        return new PrismaService(process.env.DATABASE_URL);
      },
      inject: [],
    },
    {
      provide: ProductsDBRepository,
      useFactory: (prismaService: PrismaService) => {
        return new ProductsDBRepository(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: ProductsV2Service,
      useFactory: (productsDBRepository: ProductsDBRepository) => {
        return new ProductsV2Service(productsDBRepository);
      },
      inject: [ProductsDBRepository],
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
