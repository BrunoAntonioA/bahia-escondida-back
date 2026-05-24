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
import { AddProductOptionsDto } from './dto/add-product-options.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from 'src/services/products/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getClientProducts(@CurrentClientId() clientId: number) {
    return this.productsService.getClientProducts(clientId);
  }

  @Post()
  createProduct(
    @CurrentClientId() clientId: number,
    @Body() body: CreateProductDto,
  ) {
    return this.productsService.create(clientId, body);
  }

  @Post(':productId/options')
  addProductOptions(
    @CurrentClientId() clientId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: AddProductOptionsDto,
  ) {
    return this.productsService.addOptions(clientId, productId, body);
  }

  @Delete('/:productId')
  deleteProduct(
    @CurrentClientId() clientId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productsService.delete(clientId, productId);
  }
}
