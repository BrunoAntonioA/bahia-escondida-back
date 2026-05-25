import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { SalesService } from 'src/services/sales/sales.service';
import { SalesPaymentSummaryDto } from 'src/swagger/schemas/sales-summary.schema';
import {
  DeletedSaleDto,
  SaleDto,
  SaleProductLineDto,
  TableWithSalesDto,
} from 'src/swagger/schemas/sale.schema';

@ApiTags('sales')
@ApiBearerAuth('bearer')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Payment and sales summary for a date range',
    description:
      'Returns aggregated payment totals and all sales created or closed in the range, each with payments from the same period.',
  })
  @ApiOkResponse({ type: SalesPaymentSummaryDto })
  getPaymentSummary(
    @CurrentClientId() clientId: number,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.salesService.getPaymentSummary(clientId, query);
  }

  @Get('tables')
  @ApiOperation({
    summary: 'List dine-in tables with their sales and payments',
    description:
      'Returns sales grouped by table number (non-delivery only). Each sale includes products and payment records.',
  })
  @ApiOkResponse({ type: [TableWithSalesDto] })
  getTablesWithPayments(@CurrentClientId() clientId: number) {
    return this.salesService.getTablesWithPayments(clientId);
  }

  @Get()
  @ApiOperation({
    summary: 'List sales for the authenticated client',
    description:
      'Includes product lines, selected options, and payments for each sale.',
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
  @ApiOkResponse({
    type: SaleDto,
    description: 'Includes products, selected options, and payments',
  })
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
