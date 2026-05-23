import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateSaleDto } from 'src/api/sales/dto/create-sale.dto';
import { Sale, SaleProductEntry, SaleProductLine } from 'src/models/sales.models';
import { decimalToNumber } from 'src/shared/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';

const saleWithLines = {
  products: {
    include: {
      product: true,
    },
  },
} satisfies Prisma.SaleInclude;

type SaleWithLines = Prisma.SaleGetPayload<{ include: typeof saleWithLines }>;

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

  public async addProductToSale(
    clientId: number,
    saleId: number,
    productId: number,
    quantity: number,
    tx: PrismaService = this.prismaService,
  ): Promise<SaleProductEntry | null> {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, clientId },
    });

    if (!sale) {
      return null;
    }

    const product = await tx.product.findFirst({
      where: { id: productId, clientId },
    });

    if (!product) {
      return null;
    }

    const existing = await tx.saleProduct.findUnique({
      where: {
        saleId_productId: { saleId, productId },
      },
    });

    if (existing) {
      const updated = await tx.saleProduct.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });

      return {
        id: updated.id,
        saleId: updated.saleId,
        productId: updated.productId,
        quantity: updated.quantity,
      };
    }

    const created = await tx.saleProduct.create({
      data: {
        saleId,
        productId,
        name: product.name,
        price: product.price,
        quantity,
      },
    });

    return {
      id: created.id,
      saleId: created.saleId,
      productId: created.productId,
      quantity: created.quantity,
    };
  }

  public async deleteSaleProduct(
    clientId: number,
    saleId: number,
    productId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<boolean> {
    const result = await tx.saleProduct.deleteMany({
      where: {
        saleId,
        productId,
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

  private toSaleProductLine(
    line: SaleWithLines['products'][number],
  ): SaleProductLine {
    return {
      id: line.id,
      productId: line.productId,
      name: line.name,
      price: decimalToNumber(line.price),
      quantity: line.quantity,
      category: line.product.category,
      clientId: line.product.clientId,
    };
  }
}
