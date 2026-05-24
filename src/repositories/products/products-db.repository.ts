import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from 'src/api/products/dto/create-product.dto';
import { Product, ProductOption } from 'src/models/products.models';
import { decimalToNumber } from 'src/shared/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';

const productWithOptions = {
  options: {
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.ProductInclude;

type ProductWithOptions = Prisma.ProductGetPayload<{
  include: typeof productWithOptions;
}>;

@Injectable()
export class ProductsDBRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    clientId: number,
    product: CreateProductDto,
    tx: PrismaService = this.prismaService,
  ): Promise<Product> {
    const createdProduct = await tx.product.create({
      data: {
        name: product.name,
        price: product.price,
        category: product.category,
        clientId,
        status: ProductStatus.active,
        ...(product.options?.length && {
          options: {
            create: product.options.map((option) => ({
              name: option.name,
              price: option.price,
            })),
          },
        }),
      },
      include: productWithOptions,
    });

    return this.toProduct(createdProduct);
  }

  public async findByClientId(
    clientId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Product[]> {
    const products = await tx.product.findMany({
      where: { clientId, status: ProductStatus.active },
      include: productWithOptions,
      orderBy: { name: 'asc' },
    });

    return products.map((item) => this.toProduct(item));
  }

  public async deactivate(
    clientId: number,
    productId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Product> {
    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
        clientId,
      },
      data: {
        status: ProductStatus.inactive,
      },
      include: productWithOptions,
    });

    return this.toProduct(updatedProduct);
  }

  public async findByIdForClient(
    clientId: number,
    productId: number,
    tx: PrismaService = this.prismaService,
  ): Promise<Product | null> {
    const product = await tx.product.findFirst({
      where: { id: productId, clientId, status: ProductStatus.active },
      include: productWithOptions,
    });

    if (!product) {
      return null;
    }

    return this.toProduct(product);
  }

  public async addOptions(
    clientId: number,
    productId: number,
    options: { name: string; price: number }[],
    tx: PrismaService = this.prismaService,
  ): Promise<Product | null> {
    const product = await tx.product.findFirst({
      where: { id: productId, clientId, status: ProductStatus.active },
    });

    if (!product) {
      return null;
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        options: {
          create: options.map((option) => ({
            name: option.name,
            price: option.price,
          })),
        },
      },
      include: productWithOptions,
    });

    return this.toProduct(updatedProduct);
  }

  public isNotFoundError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }

  private toProduct(product: ProductWithOptions): Product {
    return plainToInstance(Product, {
      id: product.id,
      clientId: product.clientId,
      name: product.name,
      price: decimalToNumber(product.price),
      category: product.category as Product['category'],
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      options: product.options.map((option) => this.toProductOption(option)),
    });
  }

  private toProductOption(
    option: ProductWithOptions['options'][number],
  ): ProductOption {
    return plainToInstance(ProductOption, {
      id: option.id,
      productId: option.productId,
      name: option.name,
      price: decimalToNumber(option.price),
    });
  }
}
