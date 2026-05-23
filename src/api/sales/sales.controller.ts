import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentClientId } from 'src/api/auth/decorators/current-client-id.decorator';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from 'src/services/sales/sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  getSalesByClient(@CurrentClientId() clientId: number) {
    return this.salesService.getSalesByClientId(clientId);
  }

  @Post()
  createSale(
    @CurrentClientId() clientId: number,
    @Body() body: CreateSaleDto,
  ) {
    return this.salesService.create(clientId, body);
  }

  @Get('/:saleId')
  getSaleById(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.salesService.getSaleById(clientId, saleId);
  }

  @Post('add-product')
  addProductToSale(
    @CurrentClientId() clientId: number,
    @Body() body: { saleId: number; productId: number; quantity: number },
  ) {
    return this.salesService.addProductToSale(
      clientId,
      body.saleId,
      body.productId,
      body.quantity,
    );
  }

  @Post('close/:saleId')
  closeSale(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.salesService.closeSale(clientId, saleId);
  }

  @Delete(':saleId')
  deleteSale(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.salesService.deleteSale(clientId, saleId);
  }

  @Delete(':saleId/product/:productId')
  deleteSaleProduct(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.salesService.deleteSaleProduct(clientId, saleId, productId);
  }
}
