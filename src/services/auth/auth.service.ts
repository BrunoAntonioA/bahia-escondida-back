import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/api/auth/dto/register.dto';
import { LoginDto } from 'src/api/auth/dto/login.dto';
import {
  AuthResponse,
  JwtPayload,
  PublicUser,
  User,
} from 'src/models/user.models';
import { UserDBRepository } from 'src/repositories/user/user-db.repository';
import { AppLoggerService } from 'src/services/logging/app-logger.service';

const BCRYPT_ROUNDS = 10;
const LOG_CONTEXT = 'AuthService';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserDBRepository,
    private readonly jwtService: JwtService,
    private readonly appLogger: AppLoggerService,
  ) {}

  public async register(dto: RegisterDto): Promise<AuthResponse> {
    this.appLogger.log(LOG_CONTEXT, 'Registering user', {
      email: dto.email,
      clientId: dto.clientId,
      role: dto.role,
    });

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.userRepository.create({
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        role: dto.role,
        clientId: dto.clientId,
      });

      this.appLogger.log(LOG_CONTEXT, 'User registered', {
        userId: user.id,
        email: user.email,
        clientId: user.clientId,
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (this.userRepository.isUniqueConstraintError(error)) {
        this.appLogger.warn(LOG_CONTEXT, 'Registration failed: email already exists', {
          email: dto.email,
        });
        throw new ConflictException('Email is already registered');
      }

      this.appLogger.error(LOG_CONTEXT, 'Registration failed', error, {
        email: dto.email,
      });
      throw error;
    }
  }

  public async login(dto: LoginDto): Promise<AuthResponse> {
    this.appLogger.log(LOG_CONTEXT, 'Login attempt', { email: dto.email });

    const user = await this.userRepository.findByEmailWithPassword(dto.email);

    if (!user) {
      this.appLogger.warn(LOG_CONTEXT, 'Login failed: user not found', {
        email: dto.email,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      this.appLogger.warn(LOG_CONTEXT, 'Login failed: invalid password', {
        email: dto.email,
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    this.appLogger.log(LOG_CONTEXT, 'Login successful', {
      userId: user.id,
      email: user.email,
      clientId: user.clientId,
    });

    const profile = await this.userRepository.findByIdWithClientName(user.id);

    return this.buildAuthResponse(user, profile ?? undefined);
  }

  public async validateUserById(id: number): Promise<PublicUser | null> {
    this.appLogger.debug(LOG_CONTEXT, 'Validating user by id', { userId: id });

    const user = await this.userRepository.findById(id);

    if (!user) {
      this.appLogger.warn(LOG_CONTEXT, 'User validation failed', { userId: id });
      return null;
    }

    return this.toPublicUser(user);
  }

  public async getMe(userId: number): Promise<PublicUser> {
    this.appLogger.log(LOG_CONTEXT, 'Fetching current user profile', { userId });

    const profile = await this.userRepository.findByIdWithClientName(userId);

    if (!profile) {
      this.appLogger.warn(LOG_CONTEXT, 'User profile not found', { userId });
      throw new NotFoundException('User not found');
    }

    return profile;
  }

  private buildAuthResponse(user: User, publicUser?: PublicUser): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    };

    return {
      user: publicUser ?? this.toPublicUser(user),
      accessToken: this.jwtService.sign(payload),
    };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    };
  }
}
