import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsDBRepository } from 'src/repositories/products/products-db.repository';
import { AppLoggerService } from 'src/services/logging/app-logger.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsDBRepository,
          useValue: {
            create: jest.fn(),
            findByClientId: jest.fn(),
            deactivate: jest.fn(),
            addOptions: jest.fn(),
            isNotFoundError: jest.fn(),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
