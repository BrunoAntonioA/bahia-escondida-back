import { UserRole } from '@prisma/client';

export class BaseUser {
  email: string;
  name?: string;
  role?: UserRole;
  clientId?: number;
}

export class User extends BaseUser {
  id: number;
  role: UserRole;
  clientId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserWithPassword extends User {
  password: string;
}

export class PublicUser {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  clientId?: number;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  clientId?: number;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}
