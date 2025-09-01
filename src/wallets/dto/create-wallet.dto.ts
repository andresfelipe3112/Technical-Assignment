import { InputType, Field } from '@nestjs/graphql';
import { WalletType } from '../entities/wallet.entity';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateWalletDto {
  @Field()
  name: string;

  @Field()
  balance: number;


  @Field(() => WalletType)
    @IsOptional()
  type: WalletType;
}
