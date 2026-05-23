import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUser } from 'src/models/user.models';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
