import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(() => String)
  // ()안의 인자는 중요하지 않음, Field는 graphQl용
  name: string;

  @Field(() => Boolean)
  isVegan?: boolean;

  @Field(() => String)
  address: string;

  @Field(() => String)
  ownerName: string;
}
