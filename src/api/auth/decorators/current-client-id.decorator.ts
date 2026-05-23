import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PublicUser } from 'src/models/user.models';

export const CurrentClientId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as PublicUser | undefined;

    if (!user?.clientId) {
      throw new ForbiddenException('User is not assigned to a client');
    }

    return user.clientId;
  },
);
