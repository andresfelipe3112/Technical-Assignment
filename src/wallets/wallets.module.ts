
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';

import { Wallet } from './entities/wallet.entity';
import { WalletsController } from './wallets.controller';
import { WalletsResolver } from './wallets.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsResolver],
  exports: [WalletsService],
})
export class WalletsModule {}