import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { IUser } from 'src/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): IUser => {
    const req: Request = ctx.switchToHttp().getRequest();

    return req.user as IUser;
  },
);

export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
