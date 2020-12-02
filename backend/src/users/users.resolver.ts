import { Args, Mutation, Resolver } from '@nestjs/graphql';
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
}
