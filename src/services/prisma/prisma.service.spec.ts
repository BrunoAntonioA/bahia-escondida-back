import { PrismaErrorCodes, PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    process.env.DATABASE_URL_V2 = 'DATABASE_URL';
    prismaService = new PrismaService(process.env.DATABASE_URL_V2);

    jest
      .spyOn(prismaService, '$extends')
      .mockImplementation(((json) => json) as any);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('$retryableTransaction', () => {
    it('should retry transaction', async () => {
      const error = new Error();
      (error as any).code = PrismaErrorCodes.Retry;
      const callback = jest.fn().mockRejectedValue(error);
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((callback) => callback({} as any));

      await prismaService.$retryableTransaction(callback, { maxRetries: 2 });

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should throw error if not retryable', async () => {
      const error = new Error();
      const callback = jest.fn().mockRejectedValue(error);
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((callback) => callback({} as any));

      await expect(
        prismaService.$retryableTransaction(callback, { maxRetries: 2 }),
      ).rejects.toEqual(error);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
