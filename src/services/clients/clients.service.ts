import { Injectable } from '@nestjs/common';
import { BaseClient, Client } from 'src/models/clients.models';
import { ClientDBRepository } from 'src/repositories/client/client-db.repository';
import { AppLoggerService } from 'src/services/logging/app-logger.service';

const LOG_CONTEXT = 'ClientsService';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientRepository: ClientDBRepository,
    private readonly appLogger: AppLoggerService,
  ) {}

  public async create(client: BaseClient): Promise<Client> {
    this.appLogger.log(LOG_CONTEXT, 'Creating client', {
      name: client.name,
      email: client.email,
    });

    const created = await this.clientRepository.create(client);

    this.appLogger.log(LOG_CONTEXT, 'Client created', {
      clientId: created.id,
      name: created.name,
    });

    return created;
  }
}
