import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { BaseClient, Client } from 'src/models/clients.models';

@Injectable()
export class ClientDBRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(
    client: BaseClient,
    tx: PrismaService = this.prismaService,
  ): Promise<Client> {
    const createdClient = await tx.client.create({
      data: {
        ...client,
      },
    });

    return plainToInstance(Client, createdClient);
  }
  /*
  public async getBoosterConfigsByBoosterId(boosterId: number, tx: PrismaServiceV2 = this.prismaService): Promise<BoosterConfig[]> {
    const boosterConfigs = await tx.boosterConfig.findMany({
      where: {
        boosterId,
        ...ACTIVE_RECORD_END_DATE_CONDITION(),
      },
    });

    return boosterConfigs.map((boosterConfig) => plainToInstance(BoosterConfigDto, boosterConfig));
  }

  public async getBoosterConfigs(filters?: AvailableBoosterConfigFilters): Promise<BoosterConfig[]> {
    const boosterConfigs = await this.prismaService.boosterConfig.findMany({
      where: this.buildWhere(filters),
    });

    return boosterConfigs.map((boosterConfig) => plainToInstance(BoosterConfigDto, boosterConfig));
  }

  private buildWhere(query?: AvailableBoosterConfigFilters): Prisma.BoosterConfigWhereInput | undefined {
    const conditions: Prisma.BoosterConfigWhereInput[] = [];

    if (query?.deletionPreFilter) {
      conditions.push({ deletionPreFilter: query.deletionPreFilter });
    }

    if (query?.creationPreFilter) {
      conditions.push({ creationPreFilter: query.creationPreFilter });
    }

    if (query?.endDate) {
      conditions.push({
        OR: [
          { endDate: null },
          {
            endDate: {
              gt: query.endDate,
            },
          },
        ],
      });
    }

    if (!conditions.length) {
      return undefined;
    }

    return {
      AND: conditions,
    };
  }

  public async disableBoosterConfig(id: number, tx: PrismaServiceV2 = this.prismaService): Promise<void> {
    await tx.boosterConfig.update({
      where: {
        id,
      },
      data: {
        endDate: new Date(),
      },
    });
  }
    */
}
