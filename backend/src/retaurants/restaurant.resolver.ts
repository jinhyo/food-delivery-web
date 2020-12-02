import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

// @Resolver() 이것과 기능은 같음
@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @Query((returns) => Boolean) or
  @Query(() => Boolean) // graphQl 용
  restaurants(@Args('veganOnly') veganOnly: boolean): boolean {
    // @Args('veganOnly')는 graphQl을 위해 필요
    // 뒤의 veganOnly: boolean는 typescript용
    return true;
  }

  @Query(() => [Restaurant])
  restaurants2(): Promise<Restaurant[]> {
    // @Args('veganOnly')는 graphQl을 위해 필요
    // 뒤의 veganOnly: boolean는 typescript용
    return this.restaurantService.getAll();
  }

  @Mutation(() => Boolean)
  async createRestaurant(
    // @Args() restaurantInfo: CreateRestaurantDTO, =  DTO를 @ArgsType으로 작성했을 경우
    @Args('input') createRestaurantDTO: CreateRestaurantDTO, // DTO를 @ArgsType 으로 작성했을 경우
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDTO);

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  }
}
