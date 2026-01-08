import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from 'src/services/products/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('/:clientId')
  getClientProducts(@Param('clientId') clientId: string) {
    console.log('Retrieving products for clientId: ', clientId);
    return this.productsService.getClientProducts(clientId);
  }

  @Post()
  createProduct(@Body() body) {
    console.log('Received product creation request: ', body);
    return this.productsService.create(body);
  }

  @Delete('/:productId')
  deleteProduct(@Param('productId') productId: string) {
    console.log('Deleting product with productId: ', productId);
    return this.productsService.delete(productId);
  }
}
