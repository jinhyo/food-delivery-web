import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: string, context: ExecutionContext): User => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { user } = gqlContext;

    return data ? user[data] : user;
  },
);
