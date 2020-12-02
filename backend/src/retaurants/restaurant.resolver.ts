import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

// @Resolver() 이것과 기능은 같음
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @Query((returns) => Boolean) or
  @Query(() => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Promise<Restaurant[]> {
    // @Args('veganOnly')는 graphQl을 위해 필요
    // 뒤의 veganOnly: boolean는 typescript용
    return this.restaurantService.getAll();
  }

  @Query(() => [Restaurant])
  restaurants2(): Restaurant[] {
    // @Args('veganOnly')는 graphQl을 위해 필요
    // 뒤의 veganOnly: boolean는 typescript용
    return [];
  }

  @Mutation(() => Boolean)
  createRestaurant(
    // @Args('restaurantInfo') restaurantInfo: CreateRestaurantDTO, =  DTO를 @InputType으로 작성했을 경우
    @Args() restaurantInfo: CreateRestaurantDTO, // DTO를 @ArgsType 으로 작성했을 경우
  ): boolean {
    return true;
  }
}
