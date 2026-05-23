import { PrismaService } from 'src/services/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from 'src/api/products/dto/create-product.dto';
import { Product } from 'src/models/products.models';

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
        client: {
          connect: { id: clientId },
        },
      },
    });

    return plainToInstance(Product, {
      ...createdProduct,
      price: Number(createdProduct.price),
      category: createdProduct.category as Product['category'],
    });
  }
}
