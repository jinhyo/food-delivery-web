import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

// @InputType()을 사용하면 graphQl에서 인자를 적을 때
// mutation { createRestaurant(createRestaurantInput: {name: asd, ...})} 이런식으로 입력해야함

// @ArgsType() //를 사용하면
// mutation { createRestaurant(name: asd, ...)} 이런식으로 입력할 수 있음

// @InputType()
// export class CreateRestaurantDTO {
//   @Field(() => String)
//   @IsString()
//   @Length(5, 10)
//   name: string;

//   @Field(() => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(() => String)
//   @IsString()
//   address: string;

//   @Field(() => String)
//   @IsString()
//   ownerName: string;
// }

// 위에 대신 @Entity와 연동 되도록 해서 @Entity를 사용해
// DTO와 graphQl 둘을 자동으로 정의한다.
// OmitType은 @InputType에서만 작동하므로 3번째 인자에서 @InputType으로 변경해줘야 한다.
// 또는 @Entity에 @InputType({isAbstract: true})를 해줘야 한다.
@InputType()
export class CreateRestaurantInputDTO extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => String)
  @IsString()
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutputDTO extends OutputDTO {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
