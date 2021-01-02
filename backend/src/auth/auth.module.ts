import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }, // AppModule의 imports에 AuthModule이 추가되면 전체 모듈들의 resolver에 적용됨
  ],
})
export class AuthModule {}
