import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from './client';
import { PrismaServiceV2 } from '../prisma.service';

jest.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaServiceV2>(),
}));

beforeEach(() => {
  mockReset(prismaV2Mock);
});

describe('root', () => {
  it('should be defined.', () => {
    expect(prismaV2Mock).toBeDefined();
  });
});

export const prismaV2Mock = prisma as unknown as DeepMockProxy<PrismaServiceV2>;
