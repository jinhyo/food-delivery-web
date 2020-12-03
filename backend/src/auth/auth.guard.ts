import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // http용 context이니 graphQl용으로 바꿔야함
    const gqlContext = GqlExecutionContext.create(context).getContext();

    if (!gqlContext.user) {
      return false;
    }
    return true;
  }
}
