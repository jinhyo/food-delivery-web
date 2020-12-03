import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInputDTO {
  @Field(() => Number)
  id: number;
}

@ObjectType()
export class UserProfileOutputDTO extends OutputDTO {
  @Field(() => User, { nullable: true })
  user?: User;
}
