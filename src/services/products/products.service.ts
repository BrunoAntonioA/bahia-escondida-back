import { Injectable, NotFoundException } from '@nestjs/common';
import { AddProductOptionsDto } from 'src/api/products/dto/add-product-options.dto';
import { CreateProductDto } from 'src/api/products/dto/create-product.dto';
import { Product } from 'src/models/products.models';
import { ProductsDBRepository } from 'src/repositories/products/products-db.repository';
import { AppLoggerService } from 'src/services/logging/app-logger.service';

const LOG_CONTEXT = 'ProductsService';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsDBRepository,
    private readonly appLogger: AppLoggerService,
  ) {}

  public async create(
    clientId: number,
    product: CreateProductDto,
  ): Promise<Product> {
    this.appLogger.log(LOG_CONTEXT, 'Creating product', {
      clientId,
      name: product.name,
      category: product.category,
      optionsCount: product.options?.length ?? 0,
    });

    const created = await this.productsRepository.create(clientId, product);

    this.appLogger.log(LOG_CONTEXT, 'Product created', {
      clientId,
      productId: created.id,
      name: created.name,
    });

    return created;
  }

  public async getClientProducts(clientId: number): Promise<Product[]> {
    this.appLogger.log(LOG_CONTEXT, 'Fetching products', { clientId });

    const products = await this.productsRepository.findByClientId(clientId);

    this.appLogger.log(LOG_CONTEXT, 'Products fetched', {
      clientId,
      count: products.length,
    });

    return products;
  }

  public async delete(clientId: number, productId: number): Promise<Product> {
    this.appLogger.log(LOG_CONTEXT, 'Deactivating product', { clientId, productId });

    try {
      const product = await this.productsRepository.deactivate(clientId, productId);

      this.appLogger.log(LOG_CONTEXT, 'Product deactivated', {
        clientId,
        productId,
        name: product.name,
      });

      return product;
    } catch (error) {
      if (this.productsRepository.isNotFoundError(error)) {
        this.appLogger.warn(LOG_CONTEXT, 'Product not found for deactivation', {
          clientId,
          productId,
        });
        throw new NotFoundException('Product not found');
      }

      this.appLogger.error(LOG_CONTEXT, 'Failed to deactivate product', error, {
        clientId,
        productId,
      });
      throw error;
    }
  }

  public async addOptions(
    clientId: number,
    productId: number,
    dto: AddProductOptionsDto,
  ): Promise<Product> {
    this.appLogger.log(LOG_CONTEXT, 'Adding product options', {
      clientId,
      productId,
      optionsCount: dto.options.length,
    });

    const product = await this.productsRepository.addOptions(
      clientId,
      productId,
      dto.options,
    );

    if (!product) {
      this.appLogger.warn(LOG_CONTEXT, 'Product not found for adding options', {
        clientId,
        productId,
      });
      throw new NotFoundException('Product not found');
    }

    this.appLogger.log(LOG_CONTEXT, 'Product options added', {
      clientId,
      productId,
      totalOptions: product.options.length,
    });

    return product;
  }
}
