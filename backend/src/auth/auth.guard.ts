import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // http용 context이니 graphQl용으로 바꿔야함
    const gqlContext = GqlExecutionContext.create(context).getContext();

    if (!gqlContext.user) {
      return false;
      // false일 경우 "Forbidden resource" 에러 발생
    }
    return true;
  }
}
