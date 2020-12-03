import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInputDTO,
  CreateAccountOutputDTO,
} from './dto/create-account.dto';
import { LoginInputDTO, LoginOutputDTO } from './dto/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => CreateAccountOutputDTO)
  createAccount(
    @Args('userInfo') userInfo: CreateAccountInputDTO,
  ): Promise<CreateAccountOutputDTO> {
    return this.userService.createAccount(userInfo);
  }

  @Mutation(() => LoginOutputDTO)
  login(@Args('loginData') loginData: LoginInputDTO): Promise<LoginOutputDTO> {
    return this.userService.login(loginData);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User): User {
    return authUser;
  }
}
