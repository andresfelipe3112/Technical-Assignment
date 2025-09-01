import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet, WalletType } from './entities/wallet.entity';


@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async createWallet(userId: string, type: WalletType = WalletType.PERSONAL): Promise<Wallet> {
    const walletNumber = this.generateWalletNumber();
    
    const wallet = this.walletsRepository.create({
      userId,
      walletNumber,
      type,
      balance: 1000,
    });

    return this.walletsRepository.save(wallet);
  }

  async findByUserId(userId: string): Promise<Wallet[]> {
    return this.walletsRepository.find({
      where: { userId, isActive: true },
      relations: ['user'],
    });
  }

  async findByWalletNumber(walletNumber: string): Promise<Wallet | null> {
    return this.walletsRepository.findOne({
      where: { walletNumber, isActive: true },
      relations: ['user'],
    });
  }

  async updateBalance(walletId: string, newBalance: number): Promise<void> {
    await this.walletsRepository.update(walletId, { balance: newBalance });
  }

  async findByWalletId(walletId: string): Promise<Wallet | null> {
  return this.walletsRepository.findOne({
    where: { id: walletId, isActive: true },
    relations: ['user'],
  });
}


  async transferBalance(fromWalletId: string, toWalletId: string, amount: number): Promise<void> {
    return this.dataSource.transaction(async manager => {
      const fromWallet = await manager.findOne(Wallet, { 
        where: { id: fromWalletId } 
      });
      const toWallet = await manager.findOne(Wallet, { 
        where: { id: toWalletId } 
      });

      if (!fromWallet || !toWallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (fromWallet.balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      fromWallet.balance = Number(fromWallet.balance) - Number(amount);
      toWallet.balance = Number(toWallet.balance) + Number(amount);

      await manager.save([fromWallet, toWallet]);
    });
  }

  private generateWalletNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `W${timestamp}${random}`;
  }
}