import {
  ConflictException,
  Injectable,
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

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserDBRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.userRepository.create({
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        role: dto.role,
        clientId: dto.clientId,
      });
      console.log('created user: ', user);
      return this.buildAuthResponse(user);
    } catch (error) {
      if (this.userRepository.isUniqueConstraintError(error)) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  public async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  public async validateUserById(id: number): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return null;
    }

    return this.toPublicUser(user);
  }

  private buildAuthResponse(user: User): AuthResponse {
    const publicUser = this.toPublicUser(user);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    };

    return {
      user: publicUser,
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
