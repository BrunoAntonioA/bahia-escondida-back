import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export enum PrismaErrorCodes {
  ForeignKeyViolation = 'P2003',
  NotFound = 'P2025',
  Retry = 'P2034',
  UniqueConstraintViolation = 'P2002',
}

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly dbUrl: string) {
    super({
      datasources: {
        db: { url: dbUrl },
      },
    });
  }

  public async $retryableTransaction(
    callback: (prisma: Prisma.TransactionClient) => Promise<any>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
      maxRetries?: number;
    },
  ) {
    const maxRetries = options?.maxRetries ?? 1;
    if (options) {
      delete options.maxRetries;
    }

    let retries = 0;
    let result;

    while (retries < maxRetries) {
      try {
        result = await this.$transaction(callback, options);
        break;
      } catch (error) {
        if (error.code === PrismaErrorCodes.Retry) {
          retries++;
          continue;
        }
        throw error;
      }
    }

    return result;
  }
}
