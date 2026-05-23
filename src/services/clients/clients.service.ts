import { Injectable } from '@nestjs/common';
import { BaseClient, Client } from 'src/models/clients.models';
import { ClientDBRepository } from 'src/repositories/client/client-db.repository';

@Injectable()
export class ClientsService {
  constructor(private readonly clientRepository: ClientDBRepository) {}

  public async create(client: BaseClient): Promise<Client> {
    return await this.clientRepository.create(client);
  }
}
