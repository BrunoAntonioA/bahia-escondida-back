import { Body, Controller, Post } from '@nestjs/common';
import { ClientsService } from 'src/services/clients/clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  createClient(@Body() body) {
    const { name, email, phone, address } = body;
    return this.clientsService.create({ name, email, phone, address });
  }
}
