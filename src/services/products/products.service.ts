import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from 'src/api/products/dto/create-product.dto';
import { matchesClientId } from 'src/shared/client-id.util';
import { DbLowService } from '../db-low/db-low.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DbLowService) {}

  create(clientId: number, product: CreateProductDto) {
    const newProduct = {
      id: Date.now(),
      clientId,
      ...product,
    };

    const state = this.db.read();
    state.products.push(newProduct);
    this.db['save'](state);

    return newProduct;
  }

  getClientProducts(clientId: number) {
    const state = this.db.read();
    return state.products.filter((product) =>
      matchesClientId(product.clientId, clientId),
    );
  }

  delete(clientId: number, productId: number) {
    const state = this.db.read();
    const product = state.products.find((p) => p.id === productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!matchesClientId(product.clientId, clientId)) {
      throw new ForbiddenException('Product does not belong to this client');
    }

    state.products = state.products.filter((p) => p.id !== productId);
    this.db['save'](state);

    return { deletedProductId: productId };
  }
}
