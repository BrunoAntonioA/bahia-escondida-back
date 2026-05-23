import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from 'src/services/auth/auth.service';
import { UserDBRepository } from 'src/repositories/user/user-db.repository';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN_SECONDS
          ? Number(process.env.JWT_EXPIRES_IN_SECONDS)
          : 60 * 60 * 24 * 7,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: PrismaService,
      useFactory: () => {
        return new PrismaService(process.env.DATABASE_URL);
      },
      inject: [],
    },
    {
      provide: UserDBRepository,
      useFactory: (prismaService: PrismaService) => {
        return new UserDBRepository(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: AuthService,
      useFactory: (userRepository: UserDBRepository, jwtService: JwtService) => {
        return new AuthService(userRepository, jwtService);
      },
      inject: [UserDBRepository, JwtService],
    },
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
