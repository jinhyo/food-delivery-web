import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInputDTO extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutputDTO extends OutputDTO {}
