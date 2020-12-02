import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OutputDTO {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  ok: boolean;
}
