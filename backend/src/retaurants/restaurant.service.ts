import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInputDTO,
  CreateRestaurantOutputDTO,
} from './dto/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepos: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepos: Repository<Category>,
  ) {}

  async createRestaurant(
    restaurantInfos: CreateRestaurantInputDTO,
    loginUser: User,
  ): Promise<CreateRestaurantOutputDTO> {
    try {
      const categoryName = restaurantInfos.categoryName
        .trim()
        .toLowerCase()
        .replace(/ +/g, ' ');
      const categorySlug = categoryName.replace(/ /g, '-');

      let category = await this.categoryRepos.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categoryRepos.save(
          this.categoryRepos.create({ name: categoryName, slug: categorySlug }),
        );
      }

      const restaurant = await this.restaurantRepos.save({
        ...restaurantInfos,
        owner: loginUser,
        category,
      });

      return { ok: true, restaurant };
    } catch (error) {
      console.error(error);
      return { ok: false, error: error.message };
    }
  }
}
