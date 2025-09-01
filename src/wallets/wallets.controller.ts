import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WalletsService } from './wallets.service';

import { User } from '../users/entities/user.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletType } from './entities/wallet.entity';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
create(@CurrentUser() user: User, @Body() createWalletDto: CreateWalletDto) {
  return this.walletsService.createWallet(
    user.id,
    createWalletDto?.type ?? WalletType.PERSONAL
  );
}


  @Get()
  findMyWallets(@CurrentUser() user: User) {
    return this.walletsService.findByUserId(user.id);
  }

  @Get(':walletNumber')
  findByWalletNumber(@Param('walletNumber') walletNumber: string) {
    return this.walletsService.findByWalletNumber(walletNumber);
  }


}