import { Test, TestingModule } from '@nestjs/testing';
import { DbLowService } from './db-low.service';

describe('DbLowService', () => {
  let service: DbLowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbLowService],
    }).compile();

    service = module.get<DbLowService>(DbLowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
