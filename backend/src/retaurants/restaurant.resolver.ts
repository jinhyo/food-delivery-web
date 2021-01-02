import { SetMetadata, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.decorator';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInputDTO,
  CreateRestaurantOutputDTO,
} from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutputDTO)
  @Role([UserRole.Owner])
  async createRestaurant(
    // @Args() restaurantInfo: CreateRestaurantDTO, =  DTO를 @ArgsType으로 작성했을 경우
    @Args('input') restaurantInfos: CreateRestaurantInputDTO, // DTO를 @InputType 으로 작성했을 경우
    @AuthUser() loginUser: User,
  ): Promise<CreateRestaurantOutputDTO> {
    return this.restaurantService.createRestaurant(restaurantInfos, loginUser);
  }
}
