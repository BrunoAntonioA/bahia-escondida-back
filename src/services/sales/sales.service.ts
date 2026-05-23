import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from 'src/api/sales/dto/create-sale.dto';
import { Sale } from 'src/models/sales.models';
import { SalesDBRepository } from 'src/repositories/sales/sales-db.repository';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesDBRepository) {}

  public async create(clientId: number, sale: CreateSaleDto): Promise<Sale> {
    return this.salesRepository.create(clientId, sale);
  }

  public async getSaleById(clientId: number, saleId: number): Promise<Sale> {
    const sale = await this.salesRepository.findByIdForClient(clientId, saleId);

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  public async addProductToSale(
    clientId: number,
    saleId: number,
    productId: number,
    quantity: number,
  ) {
    const line = await this.salesRepository.addProductToSale(
      clientId,
      saleId,
      productId,
      quantity,
    );

    if (!line) {
      const sale = await this.salesRepository.findByIdForClient(
        clientId,
        saleId,
      );

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      throw new NotFoundException('Product does not exist');
    }

    return line;
  }

  public async closeSale(clientId: number, saleId: number): Promise<Sale> {
    try {
      return await this.salesRepository.close(clientId, saleId);
    } catch (error) {
      if (this.salesRepository.isNotFoundError(error)) {
        throw new NotFoundException('Sale not found');
      }
      throw error;
    }
  }

  public async deleteSale(clientId: number, saleId: number) {
    try {
      await this.salesRepository.delete(clientId, saleId);
    } catch (error) {
      if (this.salesRepository.isNotFoundError(error)) {
        throw new NotFoundException('Sale not found');
      }
      throw error;
    }

    return { deletedSaleId: saleId };
  }

  public async getSalesByClientId(clientId: number): Promise<Sale[]> {
    return this.salesRepository.findByClientId(clientId);
  }

  public async deleteSaleProduct(
    clientId: number,
    saleId: number,
    productId: number,
  ) {
    const sale = await this.salesRepository.findByIdForClient(clientId, saleId);

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const deleted = await this.salesRepository.deleteSaleProduct(
      clientId,
      saleId,
      productId,
    );

    if (!deleted) {
      throw new NotFoundException('Sale product not found');
    }
  }
}
