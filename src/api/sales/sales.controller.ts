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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentClientId } from 'src/api/auth/decorators/current-client-id.decorator';
import { AddProductToSaleDto } from './dto/add-product-to-sale.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from 'src/services/sales/sales.service';
import {
  DeletedSaleDto,
  SaleDto,
  SaleProductLineDto,
} from 'src/swagger/schemas/sale.schema';

@ApiTags('sales')
@ApiBearerAuth('bearer')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({
    summary: 'List sales for the authenticated client',
    description: 'Includes product lines and selected options for each sale.',
  })
  @ApiOkResponse({ type: [SaleDto] })
  getSalesByClient(@CurrentClientId() clientId: number) {
    return this.salesService.getSalesByClientId(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiCreatedResponse({ type: SaleDto })
  createSale(
    @CurrentClientId() clientId: number,
    @Body() body: CreateSaleDto,
  ) {
    return this.salesService.create(clientId, body);
  }

  @Get('/:saleId')
  @ApiOperation({ summary: 'Get a sale by id' })
  @ApiParam({ name: 'saleId', type: Number })
  @ApiOkResponse({ type: SaleDto })
  getSaleById(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.salesService.getSaleById(clientId, saleId);
  }

  @Post('add-product')
  @ApiOperation({
    summary: 'Add a product to a sale with selected options',
    description:
      'Creates a sale line item. If the product has options, selectedOptionIds is required.',
  })
  @ApiOkResponse({ type: SaleProductLineDto })
  addProductToSale(
    @CurrentClientId() clientId: number,
    @Body() body: AddProductToSaleDto,
  ) {
    return this.salesService.addProductToSale(clientId, body);
  }

  @Post('close/:saleId')
  @ApiOperation({ summary: 'Close a sale' })
  @ApiParam({ name: 'saleId', type: Number })
  @ApiOkResponse({ type: SaleDto })
  closeSale(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.salesService.closeSale(clientId, saleId);
  }

  @Delete(':saleId')
  @ApiOperation({ summary: 'Delete a sale' })
  @ApiParam({ name: 'saleId', type: Number })
  @ApiOkResponse({ type: DeletedSaleDto })
  deleteSale(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
  ) {
    return this.salesService.deleteSale(clientId, saleId);
  }

  @Delete(':saleId/lines/:saleProductId')
  @ApiOperation({ summary: 'Remove a product line from a sale' })
  @ApiParam({ name: 'saleId', type: Number })
  @ApiParam({ name: 'saleProductId', type: Number, description: 'Sale line item id' })
  @ApiNoContentResponse({ description: 'Line item removed' })
  deleteSaleProductLine(
    @CurrentClientId() clientId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
    @Param('saleProductId', ParseIntPipe) saleProductId: number,
  ) {
    return this.salesService.deleteSaleProductLine(
      clientId,
      saleId,
      saleProductId,
    );
  }
}
