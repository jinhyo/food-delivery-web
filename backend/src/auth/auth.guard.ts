import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    ); // context.getHandler()는 해당 resolver에 적용된 @Role()을 확인해서
    // 적용된 메타데이터를 가져온다.

    console.log('roles', roles);

    if (!roles) {
      // roles가 없다는 것은 @Role()을 사용하지 않았고
      // 이는 로그인 하지 않아도 사용 가능하다는 의미
      return true;
    }

    // http용 context이니 graphQl용으로 바꿔야함
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext.user;
    if (!user) {
      return false;
      // false일 경우 403 "Forbidden resource" 에러 발생
    }
    if (roles.includes('Any') || roles.includes(user.role)) {
      return true;
    }
  }
}
