
import { IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { InputType, Field, Float } from '@nestjs/graphql';
import { TransactionType } from '../emuns/transaction.enums';


@InputType()
export class CreateTransactionDto {
  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field()
  @IsString()
  description: string;

   @Field(() => TransactionType)
  @IsEnum(TransactionType)
  type: TransactionType;

  @Field()
  @IsString()
  toWalletNumber: string;

  // Para transacciones externas
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  externalProvider?: string;
}