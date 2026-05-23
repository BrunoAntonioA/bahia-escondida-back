import { Injectable } from '@nestjs/common';
import { CreateProductDto } from 'src/api/products/dto/create-product.dto';
import { ProductsDBRepository } from 'src/repositories/products/products-db.repository';

@Injectable()
export class ProductsV2Service {
  constructor(private readonly productsDBRepository: ProductsDBRepository) {}

  public async create(clientId: number, product: CreateProductDto) {
    return await this.productsDBRepository.create(clientId, product);
  }
}
