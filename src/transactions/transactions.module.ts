
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsResolver } from './transactions.resolver';
import { Transaction } from './entities/transaction.entity';
import { ExternalPaymentProvider } from './providers/external-payment.provider';
import { WalletsModule } from '../wallets/wallets.module';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    WalletsModule,
    CacheModule.register({}),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsResolver, ExternalPaymentProvider],
  exports: [TransactionsService],
})
export class TransactionsModule {}