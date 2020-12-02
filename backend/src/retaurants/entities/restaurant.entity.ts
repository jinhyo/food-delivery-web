import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  // ()안의 인자는 중요하지 않음, Field는 graphQl용
  @Column()
  name: string;

  @Column()
  @Field(() => Boolean)
  isVegan?: boolean;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  ownerName: string;
}
