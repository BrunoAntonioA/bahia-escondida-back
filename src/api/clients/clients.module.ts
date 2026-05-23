import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from 'src/services/clients/clients.service';
import { ClientDBRepository } from 'src/repositories/client/client-db.repository';

@Module({
  controllers: [ClientsController],
  providers: [ClientDBRepository, ClientsService],
})
export class ClientsModule {}
