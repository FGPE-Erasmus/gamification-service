import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CodeSkeleton')
export class CodeSkeletonDto {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  extension?: string;

  @Field({ nullable: true })
  code?: string;
}
