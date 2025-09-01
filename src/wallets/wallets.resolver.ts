import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { WalletsService } from './wallets.service';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Request } from 'express';

@Resolver(() => Wallet)
@UseGuards(GqlAuthGuard)
export class WalletsResolver {
  constructor(private walletsService: WalletsService) {}

  @Mutation(() => Wallet)
  createWallet(
    @Args('createWalletInput') createWalletDto: CreateWalletDto,
    @Context() context: { req: Request & { user?: any } },
  ) {
    const userId = context.req.user.id;
    return this.walletsService.createWallet(userId, createWalletDto.type);
  }

  @Query(() => [Wallet])
  myWallets(@Context() context: { req: Request & { user?: any } }) {
    const userId = context.req.user.id;
    return this.walletsService.findByUserId(userId);
  }

  @Query(() => Wallet)
  walletByNumber(@Args('walletNumber') walletNumber: string) {
    return this.walletsService.findByWalletNumber(walletNumber);
  }
}
