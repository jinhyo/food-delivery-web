import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

// @InputType({isAbstract: true}) //를 통해 DTO에서 OmitType을 할 수 있음
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType() // graphQl type definition 용
@Entity() // typeorm db model 용
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  // Category를 삭제할 경우 Restaurant도 삭제되지 않도록 @Filed, @ManyToOne에
  // {nullable:true}와 onDelete:'SET NULL' 사용
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants)
  owner: User;
}
