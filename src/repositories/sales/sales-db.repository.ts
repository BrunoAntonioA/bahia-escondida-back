import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateSaleDto } from 'src/api/sales/dto/create-sale.dto';
import { AddProductToSaleDto } from 'src/api/sales/dto/add-product-to-sale.dto';
import { Payment } from 'src/models/payments.models';
import {
  PaymentTotals,
  SalesPaymentSummary,
} from 'src/models/sales-summary.models';
import { Sale, SaleProductLine, TableWithSales } from 'src/models/sales.models';
import { decimalToNumber } from 'src/shared/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';

const saleWithDetails = {
  products: {
    include: {
      product: true,
      options: {
        orderBy: { id: 'asc' as const },
      },
    },
    orderBy: { id: 'asc' as const },
  },
  payments: {
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.SaleInclude;

type SaleWithDetails = Prisma.SaleGetPayload<{ include: typeof saleWithDetails }>;
type SaleProductWithOptions = SaleWithDetails['products'][number];

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
      include: saleWithDetails,
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((sale) => this.toSaleWithDetails(sale));
  }

  public async findByIdForClient(
    clientId: number,
    saleId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Sale | null> {
    const sale = await tx.sale.findFirst({
      where: { id: saleId, clientId },
      include: saleWithDetails,
    });

    if (!sale) {
      return null;
    }

    return this.toSaleWithDetails(sale);
  }

  public async findTablesWithSales(
    clientId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<TableWithSales[]> {
    const sales = await tx.sale.findMany({
      where: {
        clientId,
        isDelivery: false,
        tableNumber: { not: null },
      },
      include: saleWithDetails,
      orderBy: [{ tableNumber: 'asc' }, { createdAt: 'desc' }],
    });

    const grouped = new Map<number, Sale[]>();

    for (const sale of sales) {
      const tableNumber = sale.tableNumber!;

      if (!grouped.has(tableNumber)) {
        grouped.set(tableNumber, []);
      }

      grouped.get(tableNumber)!.push(this.toSaleWithDetails(sale));
    }

    return Array.from(grouped.entries()).map(([tableNumber, tableSales]) => ({
      tableNumber,
      sales: tableSales,
    }));
  }

  public async getPaymentSummary(
    clientId: number,
    start: Date,
    end: Date,
    tx: PrismaService = this.prismaService,
  ): Promise<SalesPaymentSummary> {
    const payments = await tx.payment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        sale: { clientId },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mappedPayments = payments.map((payment) =>
      this.toPaymentRecord(payment),
    );
    const totals = this.calculatePaymentTotals(mappedPayments);

    const paymentsBySaleId = new Map<number, Payment[]>();

    for (const payment of mappedPayments) {
      const salePayments = paymentsBySaleId.get(payment.saleId) ?? [];
      salePayments.push(payment);
      paymentsBySaleId.set(payment.saleId, salePayments);
    }

    const sales = await tx.sale.findMany({
      where: {
        clientId,
        OR: [
          { createdAt: { gte: start, lte: end } },
          {
            closedAt: {
              gte: start,
              lte: end,
            },
          },
        ],
      },
      select: {
        id: true,
        isDelivery: true,
        tableNumber: true,
        customerNickname: true,
        closedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totals,
      sales: sales.map((sale) => ({
        isDelivery: sale.isDelivery,
        tableNumber: sale.tableNumber ?? undefined,
        customerNickname: sale.customerNickname ?? undefined,
        closedAt: sale.closedAt ?? undefined,
        createdAt: sale.createdAt,
        payments: paymentsBySaleId.get(sale.id) ?? [],
      })),
    };
  }

  public async close(
    clientId: number,
    saleId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Sale> {
    await tx.sale.update({
      where: { id: saleId, clientId },
      data: {
        status: 'cerrada',
        closedAt: new Date(),
      },
    });

    const sale = await tx.sale.findFirst({
      where: { id: saleId, clientId },
      include: saleWithDetails,
    });

    return this.toSaleWithDetails(sale!);
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

  private toSaleWithDetails(sale: SaleWithDetails): Sale {
    return {
      ...this.toSale(sale),
      products: sale.products.map((line) => this.toSaleProductLine(line)),
      payments: sale.payments.map((payment) => this.toPaymentRecord(payment)),
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

  private toPaymentRecord(payment: {
    id: number;
    saleId: number;
    cashPaid: Prisma.Decimal;
    cardPaid: Prisma.Decimal;
    transferPaid: Prisma.Decimal;
    tipPaid: Prisma.Decimal;
    createdAt: Date;
  }): Payment {
    return {
      id: payment.id,
      saleId: payment.saleId,
      cashPaid: decimalToNumber(payment.cashPaid),
      cardPaid: decimalToNumber(payment.cardPaid),
      transferPaid: decimalToNumber(payment.transferPaid),
      tipPaid: decimalToNumber(payment.tipPaid),
      createdAt: payment.createdAt,
    };
  }

  private calculatePaymentTotals(payments: Payment[]): PaymentTotals {
    const totals = payments.reduce(
      (acc, payment) => ({
        cashPaid: acc.cashPaid + payment.cashPaid,
        cardPaid: acc.cardPaid + payment.cardPaid,
        transferPaid: acc.transferPaid + payment.transferPaid,
        tipPaid: acc.tipPaid + payment.tipPaid,
      }),
      { cashPaid: 0, cardPaid: 0, transferPaid: 0, tipPaid: 0 },
    );

    return {
      ...totals,
      totalPaid:
        totals.cashPaid + totals.cardPaid + totals.transferPaid + totals.tipPaid,
      paymentCount: payments.length,
    };
  }
}
