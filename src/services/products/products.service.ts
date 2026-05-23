import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from 'src/api/products/dto/create-product.dto';
import { Product } from 'src/models/products.models';
import { ProductsDBRepository } from 'src/repositories/products/products-db.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsDBRepository) {}

  public async create(
    clientId: number,
    product: CreateProductDto,
  ): Promise<Product> {
    return this.productsRepository.create(clientId, product);
  }

  public async getClientProducts(clientId: number): Promise<Product[]> {
    return this.productsRepository.findByClientId(clientId);
  }

  public async delete(clientId: number, productId: number): Promise<Product> {
    try {
      return await this.productsRepository.deactivate(clientId, productId);
    } catch (error) {
      if (this.productsRepository.isNotFoundError(error)) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }
}
