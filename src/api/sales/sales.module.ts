import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from 'src/services/sales/sales.service';
import { SalesDBRepository } from 'src/repositories/sales/sales-db.repository';

@Module({
  controllers: [SalesController],
  providers: [SalesDBRepository, SalesService],
  exports: [SalesService],
})
export class SalesModule {}
