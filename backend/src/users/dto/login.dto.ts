import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInputDTO extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutputDTO extends OutputDTO {
  @Field(() => String, { nullable: true })
  token?: string;
}
