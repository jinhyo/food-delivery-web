import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType() // graphQl type definition 용
@Entity() // typeorm db model 용
export class Restaurant {
  @Field(() => Number) // graphQl 용
  @PrimaryGeneratedColumn() // typeorm 용
  id: number;

  @Field(() => String)
  // ()안의 인자는 중요하지 않음, Field는 graphQl용
  @Column()
  name: string;

  @Field(() => Boolean)
  @Column()
  isVegan?: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  cateogry: string;
}
