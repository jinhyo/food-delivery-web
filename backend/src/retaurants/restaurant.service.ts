import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepos: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurantRepos.find();
  }

  createRestaurant(
    createRestaurantDTO: CreateRestaurantDTO,
  ): Promise<Restaurant> {
    //   const newRestaurant = this.restaurantRepos.create({name : CreateRestaurantDTO.name ...})
    // DTO가 정의되어 있을 경우아래처럼 가능
    const newRestaurant = this.restaurantRepos.create(createRestaurantDTO);

    return this.restaurantRepos.save(newRestaurant);
  }
}
