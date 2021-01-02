import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.decorator';
import {
  CreateAccountInputDTO,
  CreateAccountOutputDTO,
} from './dto/create-account.dto';
import { LoginInputDTO, LoginOutputDTO } from './dto/login.dto';
import {
  UpdateProfileInputDTO,
  UpdateProfileOutputDTO,
} from './dto/update-profile.dto';
import {
  UserProfileInputDTO,
  UserProfileOutputDTO,
} from './dto/user-profile.dto';
import {
  VerifyEmailInputDTO,
  VerifyEmailOutputDTO,
} from './dto/verify-email.dto';
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
  @Role(['Any'])
  me(@AuthUser() authUser: User): User {
    return authUser;
  }

  @Query(() => UserProfileOutputDTO)
  @Role(['Any'])
  userProfile(
    @Args() userInfo: UserProfileInputDTO,
  ): Promise<UserProfileOutputDTO> {
    return this.userService.findUser(userInfo.id);
  }

  @Mutation(() => UpdateProfileOutputDTO)
  @Role(['Any'])
  updateProfile(
    @AuthUser() loginUser: User,
    @Args('updateData') updateData: UpdateProfileInputDTO,
  ): Promise<UpdateProfileOutputDTO> {
    return this.userService.updateProfile(loginUser.id, updateData);
  }

  @Mutation(() => VerifyEmailOutputDTO)
  verifyEmail(
    @Args('code') { code }: VerifyEmailInputDTO,
  ): Promise<VerifyEmailOutputDTO> {
    return this.userService.verifyEmail(code);
  }
}
