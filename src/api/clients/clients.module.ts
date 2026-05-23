import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from 'src/services/clients/clients.service';
import { ClientDBRepository } from 'src/repositories/client/client-db.repository';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ClientsController],
  providers: [
    {
      provide: PrismaService,
      useFactory: () => {
        return new PrismaService(process.env.DATABASE_URL);
      },
      inject: [],
    },
    {
      provide: ClientDBRepository,
      useFactory: (prismaService: PrismaService) => {
        return new ClientDBRepository(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: ClientsService,
      useFactory: (clientsRepository: ClientDBRepository) => {
        return new ClientsService(clientsRepository);
      },
      inject: [ClientDBRepository],
    },
  ],
})
export class ClientsModule {}
