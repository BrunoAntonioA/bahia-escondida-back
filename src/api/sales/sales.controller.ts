import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SalesService } from 'src/services/sales/sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  createSale(@Body() body) {
    console.log('Received sale creation request: ', body);
    return this.salesService.create(body);
  }

  @Get('/:saleId')
  getSaleById(@Param('saleId') saleId: number) {
    console.log('Retrieving sale with id: ', saleId);
    return this.salesService.getSaleById(saleId);
  }

  @Post('add-product')
  addProductToSale(@Body() body) {
    console.log('Received new product to sale: ', body);
    return this.salesService.addProductToSale(
      body.saleId,
      body.productId,
      body.quantity,
    );
  }

  @Get('/client/:clientId')
  getSaleByClientId(@Param('clientId') clientId: number) {
    console.log('Retrieving sales with client id: ', clientId);
    return this.salesService.getSalesByClientId(clientId);
  }

  @Post('close/:saleId')
  closeSale(@Param('saleId') saleId: number) {
    console.log('Received sale to close with id: ', saleId);
    return this.salesService.closeSale(saleId);
  }

  @Delete(':saleId')
  deleteSale(@Param('saleId') saleId: number) {
    console.log('Received sale to delete with id: ', saleId);
    return this.salesService.deleteSale(saleId);
  }
}
