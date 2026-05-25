import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddProductToSaleDto } from 'src/api/sales/dto/add-product-to-sale.dto';
import { DateRangeQueryDto } from 'src/api/sales/dto/date-range-query.dto';
import { CreateSaleDto } from 'src/api/sales/dto/create-sale.dto';
import { SalesPaymentSummary } from 'src/models/sales-summary.models';
import { Sale, SaleProductLine, TableWithSales } from 'src/models/sales.models';
import { SalesDBRepository } from 'src/repositories/sales/sales-db.repository';
import { AppLoggerService } from 'src/services/logging/app-logger.service';
import { parseDateRange } from 'src/shared/date-range.util';

const LOG_CONTEXT = 'SalesService';

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesDBRepository,
    private readonly appLogger: AppLoggerService,
  ) {}

  public async create(clientId: number, sale: CreateSaleDto): Promise<Sale> {
    this.appLogger.log(LOG_CONTEXT, 'Creating sale', {
      clientId,
      isDelivery: sale.isDelivery,
      tableNumber: sale.tableNumber,
    });

    const created = await this.salesRepository.create(clientId, sale);

    this.appLogger.log(LOG_CONTEXT, 'Sale created', {
      clientId,
      saleId: created.id,
    });

    return created;
  }

  public async getSaleById(clientId: number, saleId: number): Promise<Sale> {
    this.appLogger.log(LOG_CONTEXT, 'Fetching sale', { clientId, saleId });

    const sale = await this.salesRepository.findByIdForClient(clientId, saleId);

    if (!sale) {
      this.appLogger.warn(LOG_CONTEXT, 'Sale not found', { clientId, saleId });
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  public async addProductToSale(
    clientId: number,
    dto: AddProductToSaleDto,
  ): Promise<SaleProductLine> {
    this.appLogger.log(LOG_CONTEXT, 'Adding product to sale', {
      clientId,
      saleId: dto.saleId,
      productId: dto.productId,
      quantity: dto.quantity ?? 1,
      selectedOptionIds: dto.selectedOptionIds ?? [],
    });

    const result = await this.salesRepository.addProductWithOptions(
      clientId,
      dto,
    );

    if (result === 'sale_not_found') {
      this.appLogger.warn(LOG_CONTEXT, 'Sale not found when adding product', {
        clientId,
        saleId: dto.saleId,
      });
      throw new NotFoundException('Sale not found');
    }

    if (result === 'product_not_found') {
      this.appLogger.warn(LOG_CONTEXT, 'Product not found when adding to sale', {
        clientId,
        saleId: dto.saleId,
        productId: dto.productId,
      });
      throw new NotFoundException('Product not found');
    }

    if (result === 'options_required') {
      throw new BadRequestException(
        'This product requires at least one option to be selected',
      );
    }

    if (result === 'invalid_options') {
      throw new BadRequestException(
        'One or more selected options are invalid for this product',
      );
    }

    this.appLogger.log(LOG_CONTEXT, 'Product added to sale', {
      clientId,
      saleId: dto.saleId,
      saleProductId: result.id,
      selectedOptionsCount: result.selectedOptions.length,
    });

    return result;
  }

  public async closeSale(clientId: number, saleId: number): Promise<Sale> {
    this.appLogger.log(LOG_CONTEXT, 'Closing sale', { clientId, saleId });

    try {
      const sale = await this.salesRepository.close(clientId, saleId);

      this.appLogger.log(LOG_CONTEXT, 'Sale closed', {
        clientId,
        saleId,
        status: sale.status,
      });

      return sale;
    } catch (error) {
      if (this.salesRepository.isNotFoundError(error)) {
        this.appLogger.warn(LOG_CONTEXT, 'Sale not found for closing', {
          clientId,
          saleId,
        });
        throw new NotFoundException('Sale not found');
      }

      this.appLogger.error(LOG_CONTEXT, 'Failed to close sale', error, {
        clientId,
        saleId,
      });
      throw error;
    }
  }

  public async deleteSale(clientId: number, saleId: number) {
    this.appLogger.log(LOG_CONTEXT, 'Deleting sale', { clientId, saleId });

    try {
      await this.salesRepository.delete(clientId, saleId);

      this.appLogger.log(LOG_CONTEXT, 'Sale deleted', { clientId, saleId });

      return { deletedSaleId: saleId };
    } catch (error) {
      if (this.salesRepository.isNotFoundError(error)) {
        this.appLogger.warn(LOG_CONTEXT, 'Sale not found for deletion', {
          clientId,
          saleId,
        });
        throw new NotFoundException('Sale not found');
      }

      this.appLogger.error(LOG_CONTEXT, 'Failed to delete sale', error, {
        clientId,
        saleId,
      });
      throw error;
    }
  }

  public async getSalesByClientId(clientId: number): Promise<Sale[]> {
    this.appLogger.log(LOG_CONTEXT, 'Fetching sales', { clientId });

    const sales = await this.salesRepository.findByClientId(clientId);

    this.appLogger.log(LOG_CONTEXT, 'Sales fetched', {
      clientId,
      count: sales.length,
    });

    return sales;
  }

  public async getTablesWithPayments(
    clientId: number,
  ): Promise<TableWithSales[]> {
    this.appLogger.log(LOG_CONTEXT, 'Fetching tables with sales and payments', {
      clientId,
    });

    const tables = await this.salesRepository.findTablesWithSales(clientId);

    this.appLogger.log(LOG_CONTEXT, 'Tables fetched', {
      clientId,
      count: tables.length,
    });

    return tables;
  }

  public async getPaymentSummary(
    clientId: number,
    query: DateRangeQueryDto,
  ): Promise<SalesPaymentSummary> {
    const { start, end } = parseDateRange(query.startDate, query.endDate);

    if (start > end) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    this.appLogger.log(LOG_CONTEXT, 'Fetching payment summary', {
      clientId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const summary = await this.salesRepository.getPaymentSummary(
      clientId,
      start,
      end,
    );

    this.appLogger.log(LOG_CONTEXT, 'Payment summary fetched', {
      clientId,
      paymentCount: summary.totals.paymentCount,
      salesCount: summary.sales.length,
    });

    return summary;
  }

  public async deleteSaleProductLine(
    clientId: number,
    saleId: number,
    saleProductId: number,
  ) {
    this.appLogger.log(LOG_CONTEXT, 'Removing product line from sale', {
      clientId,
      saleId,
      saleProductId,
    });

    const sale = await this.salesRepository.findByIdForClient(clientId, saleId);

    if (!sale) {
      this.appLogger.warn(LOG_CONTEXT, 'Sale not found when removing product line', {
        clientId,
        saleId,
      });
      throw new NotFoundException('Sale not found');
    }

    const deleted = await this.salesRepository.deleteSaleProductLine(
      clientId,
      saleId,
      saleProductId,
    );

    if (!deleted) {
      this.appLogger.warn(LOG_CONTEXT, 'Sale product line not found for removal', {
        clientId,
        saleId,
        saleProductId,
      });
      throw new NotFoundException('Sale product line not found');
    }

    this.appLogger.log(LOG_CONTEXT, 'Product line removed from sale', {
      clientId,
      saleId,
      saleProductId,
    });
  }
}
