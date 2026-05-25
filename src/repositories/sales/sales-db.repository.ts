import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateSaleDto } from 'src/api/sales/dto/create-sale.dto';
import { AddProductToSaleDto } from 'src/api/sales/dto/add-product-to-sale.dto';
import { Sale, SaleProductLine } from 'src/models/sales.models';
import { decimalToNumber } from 'src/shared/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';

const saleWithLines = {
  products: {
    include: {
      product: true,
      options: {
        orderBy: { id: 'asc' as const },
      },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.SaleInclude;

type SaleWithLines = Prisma.SaleGetPayload<{ include: typeof saleWithLines }>;
type SaleProductWithOptions = SaleWithLines['products'][number];

@Injectable()
export class SalesDBRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    clientId: number,
    sale: CreateSaleDto,
    tx: PrismaService = this.prismaService,
  ): Promise<Sale> {
    const created = await tx.sale.create({
      data: {
        clientId,
        isDelivery: sale.isDelivery,
        tableNumber: sale.tableNumber,
        customerNickname: sale.customerNickname,
        partySize: sale.partySize,
        status: 'abierta',
      },
    });

    return this.toSale(created);
  }

  public async findByClientId(
    clientId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Sale[]> {
    const sales = await tx.sale.findMany({
      where: { clientId },
      include: saleWithLines,
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((sale) => this.toSaleWithProducts(sale));
  }

  public async findByIdForClient(
    clientId: number,
    saleId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Sale | null> {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, clientId },
      include: saleWithLines,
    });

    if (!sale) {
      return null;
    }

    return this.toSaleWithProducts(sale);
  }

  public async close(
    clientId: number,
    saleId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Sale> {
    const updated = await tx.sale.update({
      where: { id: saleId, clientId },
      data: {
        status: 'cerrada',
        closedAt: new Date(),
      },
    });

    return this.toSale(updated);
  }

  public async delete(
    clientId: number,
    saleId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<void> {
    await tx.sale.delete({
      where: { id: saleId, clientId },
    });
  }

  public async addProductWithOptions(
    clientId: number,
    dto: AddProductToSaleDto,
    tx: PrismaService = this.prismaService,
  ): Promise<
    SaleProductLine | 'sale_not_found' | 'product_not_found' | 'options_required' | 'invalid_options'
  > {
    const sale = await tx.sale.findFirst({
      where: { id: dto.saleId, clientId },
    });

    if (!sale) {
      return 'sale_not_found';
    }

    const product = await tx.product.findFirst({
      where: { id: dto.productId, clientId, status: ProductStatus.active },
      include: { options: true },
    });

    if (!product) {
      return 'product_not_found';
    }

    const selectedOptionIds = dto.selectedOptionIds ?? [];

    if (product.options.length > 0 && selectedOptionIds.length === 0) {
      return 'options_required';
    }

    const selectedOptions = product.options.filter((option) =>
      selectedOptionIds.includes(option.id),
    );

    if (selectedOptionIds.length !== selectedOptions.length) {
      return 'invalid_options';
    }

    const created = await tx.saleProduct.create({
      data: {
        saleId: dto.saleId,
        productId: dto.productId,
        name: product.name,
        price: product.price,
        quantity: dto.quantity ?? 1,
        observation: dto.observation,
        options: {
          create: selectedOptions.map((option) => ({
            productOptionId: option.id,
            optionName: option.name,
            price: option.price,
          })),
        },
      },
      include: {
        product: true,
        options: { orderBy: { id: 'asc' } },
      },
    });

    return this.toSaleProductLine(created);
  }

  public async deleteSaleProductLine(
    clientId: number,
    saleId: number,
    saleProductId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<boolean> {
    const result = await tx.saleProduct.deleteMany({
      where: {
        id: saleProductId,
        saleId,
        sale: { clientId },
      },
    });

    return result.count > 0;
  }

  public isNotFoundError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }

  private toSale(sale: {
    id: number;
    clientId: number;
    isDelivery: boolean;
    tableNumber: number | null;
    customerNickname: string | null;
    partySize: number | null;
    status: string;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Sale {
    return {
      id: sale.id,
      clientId: sale.clientId,
      isDelivery: sale.isDelivery,
      tableNumber: sale.tableNumber ?? undefined,
      customerNickname: sale.customerNickname ?? undefined,
      partySize: sale.partySize ?? undefined,
      status: sale.status,
      closedAt: sale.closedAt ?? undefined,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }

  private toSaleWithProducts(sale: SaleWithLines): Sale {
    return {
      ...this.toSale(sale),
      products: sale.products.map((line) => this.toSaleProductLine(line)),
    };
  }

  private toSaleProductLine(line: SaleProductWithOptions): SaleProductLine {
    return {
      id: line.id,
      productId: line.productId,
      name: line.name,
      price: decimalToNumber(line.price),
      quantity: line.quantity,
      observation: line.observation ?? undefined,
      category: line.product.category,
      selectedOptions: line.options.map((option) => ({
        id: option.id,
        productOptionId: option.productOptionId,
        optionName: option.optionName,
        price: decimalToNumber(option.price),
      })),
    };
  }
}
