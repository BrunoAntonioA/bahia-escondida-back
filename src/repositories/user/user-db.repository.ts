import { Prisma, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { BaseUser, User, UserWithPassword } from 'src/models/user.models';
import { PrismaService } from 'src/services/prisma/prisma.service';

export interface CreateUserData extends BaseUser {
  password: string;
  role?: UserRole;
}

export class UserDBRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async findByEmail(
    email: string,
    tx: PrismaService = this.prismaService,
  ): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email, tx);

    if (!user) {
      return null;
    }

    return plainToInstance(User, user);
  }

  public async findByEmailWithPassword(
    email: string,
    tx: PrismaService = this.prismaService,
  ): Promise<UserWithPassword | null> {
    const user = await tx.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return plainToInstance(UserWithPassword, user);
  }

  public async findById(
    id: number,
    tx: PrismaService = this.prismaService,
  ): Promise<User | null> {
    const user = await tx.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return plainToInstance(User, user);
  }

  public async create(
    data: CreateUserData,
    tx: PrismaService = this.prismaService,
  ): Promise<User> {
    const createdUser = await tx.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        name: data.name,
        role: data.role ?? UserRole.STAFF,
        clientId: data.clientId,
      },
    });

    return plainToInstance(User, createdUser);
  }

  public isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
