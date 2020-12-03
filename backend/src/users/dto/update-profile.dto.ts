import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class UpdateProfileInputDTO extends PartialType(
  PickType(User, ['email', 'password']),
) {}

@ObjectType()
export class UpdateProfileOutputDTO extends OutputDTO {}
