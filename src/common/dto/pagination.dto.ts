
import { IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginationDto {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(100)
  limit?: number = 10;
}
