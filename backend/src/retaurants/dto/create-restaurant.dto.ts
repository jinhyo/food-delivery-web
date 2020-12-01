import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// @InputType()을 사용하면 graphQl에서 인자를 적을 때
// mutation { createRestaurant(createRestaurantInput: {name: asd, ...})} 이런식으로 입력해야함

@ArgsType() //를 사용하면
// mutation { createRestaurant(name: asd, ...)} 이런식으로 입력할 수 있어서 간단함
export class CreateRestaurantDTO {
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  ownerName: string;
}
