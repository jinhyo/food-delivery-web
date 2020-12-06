import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { OutputDTO } from 'src/common/dtos/output.dto';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerifyEmailInputDTO extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyEmailOutputDTO extends OutputDTO {}
