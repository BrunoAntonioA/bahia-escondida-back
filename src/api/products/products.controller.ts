import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Version,
} from '@nestjs/common';
import { CurrentClientId } from 'src/api/auth/decorators/current-client-id.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsV2Service } from 'src/services/products-v2/products-v2.service';
import { ProductsService } from 'src/services/products/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsV2Service: ProductsV2Service,
  ) {}

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

  @Delete('/:productId')
  deleteProduct(
    @CurrentClientId() clientId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productsService.delete(clientId, productId);
  }

  @Post('/v2')
  @Version('2')
  createProductV2(
    @CurrentClientId() clientId: number,
    @Body() body: CreateProductDto,
  ) {
    return this.productsV2Service.create(clientId, body);
  }
}
