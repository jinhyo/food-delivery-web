import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @InputType({isAbstract: true}) //를 통해 DTO에서 OmitType을 할 수 있음
@ObjectType() // graphQl type definition 용
@Entity() // typeorm db model 용
export class Restaurant {
  @Field(() => Number) // ()안의 인자는 중요하지 않음, graphQl 용
  @PrimaryGeneratedColumn() // typeorm 용
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 20)
  name: string;

  @Field(() => Boolean)
  @Column()
  @IsBoolean()
  isVegan?: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  ownerName: string;
}
