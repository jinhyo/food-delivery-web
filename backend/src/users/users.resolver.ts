import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
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

  @Query(() => UserProfileOutputDTO)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userInfo: UserProfileInputDTO,
  ): Promise<UserProfileOutputDTO> {
    const user = await this.userService.findUser(userInfo.id);
    if (!user) {
      return { ok: false, error: '해당 유저가 없습니다.' };
    }
    return { ok: true, user };
  }

  @Mutation(() => UpdateProfileOutputDTO)
  @UseGuards(AuthGuard)
  async updateProfile(
    @AuthUser() loginUser: User,
    @Args('updateData') updateData: UpdateProfileInputDTO,
  ): Promise<UpdateProfileOutputDTO> {
    try {
      await this.userService.updateProfile(loginUser.id, updateData);

      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }
}
