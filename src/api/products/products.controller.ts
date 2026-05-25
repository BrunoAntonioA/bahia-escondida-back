import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentClientId } from 'src/api/auth/decorators/current-client-id.decorator';
import { AddProductOptionsDto } from './dto/add-product-options.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from 'src/services/products/products.service';
import { ProductDto } from 'src/swagger/schemas/product.schema';

@ApiTags('products')
@ApiBearerAuth('bearer')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List active products',
    description: 'Returns all active products with their options for the authenticated client.',
  })
  @ApiOkResponse({ type: [ProductDto] })
  getClientProducts(@CurrentClientId() clientId: number) {
    return this.productsService.getClientProducts(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ type: ProductDto })
  createProduct(
    @CurrentClientId() clientId: number,
    @Body() body: CreateProductDto,
  ) {
    return this.productsService.create(clientId, body);
  }

  @Post(':productId/options')
  @ApiOperation({ summary: 'Add options to an existing product' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiOkResponse({ type: ProductDto })
  addProductOptions(
    @CurrentClientId() clientId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: AddProductOptionsDto,
  ) {
    return this.productsService.addOptions(clientId, productId, body);
  }

  @Delete('/:productId')
  @ApiOperation({
    summary: 'Deactivate a product',
    description: 'Soft delete — sets product status to inactive.',
  })
  @ApiParam({ name: 'productId', type: Number })
  @ApiOkResponse({ type: ProductDto })
  deleteProduct(
    @CurrentClientId() clientId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productsService.delete(clientId, productId);
  }
}
