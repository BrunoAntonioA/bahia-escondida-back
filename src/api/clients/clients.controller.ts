import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientsService } from 'src/services/clients/clients.service';
import { ClientDto } from 'src/swagger/schemas/client.schema';

@ApiTags('clients')
@ApiBearerAuth('bearer')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a business client (tenant)',
    description: 'Creates a new restaurant/business. Requires authentication.',
  })
  @ApiCreatedResponse({ type: ClientDto })
  createClient(@Body() body: CreateClientDto) {
    return this.clientsService.create(body);
  }
}
