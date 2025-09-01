import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WalletsService } from '../wallets/wallets.service';
import { ExternalPaymentProvider } from './providers/external-payment.provider';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TransactionStatus, TransactionType } from './emuns/transaction.enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private walletsService: WalletsService,
    private externalPaymentProvider: ExternalPaymentProvider,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ================= TRANSACTIONS =================
  async createTransaction(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    this.validateUuid(userId, 'User ID');

    const userWallets = await this.walletsService.findByUserId(userId);
    if (!userWallets.length) throw new NotFoundException('User has no active wallets');

    const fromWallet = userWallets[0];

    if (dto.type === TransactionType.INTERNAL) {
      if (!dto.toWalletNumber?.trim()) throw new BadRequestException('Recipient wallet number is required for internal transactions.');
      return this.processInternalTransaction(fromWallet.id, dto);
    } else {
      if (!dto.toWalletNumber?.trim()) throw new BadRequestException('Recipient address is required for external transactions.');
      return this.processExternalTransaction(fromWallet.id, dto);
    }
  }

  private async processInternalTransaction(fromWalletId: string, dto: CreateTransactionDto): Promise<Transaction> {
    this.validateUuid(fromWalletId, 'Sender Wallet ID');

    let toWallet = await this.walletsService.findByWalletNumber(dto.toWalletNumber);

    if (!toWallet) {
      const newUserId = uuidv4();
      toWallet = await this.walletsService.createWallet(newUserId);
      if (!toWallet || !toWallet.userId) throw new Error('Failed to create recipient wallet with valid userId.');
    }

    const fromWallet = await this.walletsService.findByWalletId(fromWalletId);
    if (!fromWallet) throw new NotFoundException('Sender wallet not found');
    if (Number(fromWallet.balance) < Number(dto.amount)) throw new BadRequestException('Insufficient balance');

    return this.dataSource.transaction(async manager => {
      const transaction = this.transactionsRepository.create({
        amount: dto.amount,
        description: dto.description,
        type: dto.type,
        status: TransactionStatus.PENDING,
        transactionHash: this.generateTransactionHash(),
        fromUserId: fromWallet.userId,
        toUserId: toWallet.userId,
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
      });

      const savedTransaction = await manager.save(Transaction, transaction);

      try {
        await this.walletsService.transferBalance(fromWallet.id, toWallet.id, dto.amount);

        savedTransaction.status = TransactionStatus.COMPLETED;
        await manager.save(Transaction, savedTransaction);

        await this.invalidateUserTransactionsCache(fromWallet.userId);
        await this.invalidateUserTransactionsCache(toWallet.userId);

        return savedTransaction;
      } catch (error) {
        savedTransaction.status = TransactionStatus.FAILED;
        await manager.save(Transaction, savedTransaction);
        throw error;
      }
    });
  }

  private async processExternalTransaction(fromWalletId: string, dto: CreateTransactionDto): Promise<Transaction> {
    this.validateUuid(fromWalletId, 'Sender Wallet ID');

    const fromWallet = await this.walletsService.findByWalletId(fromWalletId);
    if (!fromWallet) throw new NotFoundException('Sender wallet not found');
    if (Number(fromWallet.balance) < Number(dto.amount)) throw new BadRequestException('Insufficient balance');

    return this.dataSource.transaction(async manager => {
      const transaction = this.transactionsRepository.create({
        amount: dto.amount,
        description: dto.description,
        type: dto.type,
        status: TransactionStatus.PENDING,
        transactionHash: this.generateTransactionHash(),
        fromUserId: fromWallet.userId,
        fromWalletId: fromWallet.id,
        externalProvider: dto.externalProvider || 'default_provider',
      });

      const savedTransaction = await manager.save(Transaction, transaction);

      try {
        const externalResult = await this.externalPaymentProvider.processExternalTransfer({
          amount: dto.amount,
          toAddress: dto.toWalletNumber,
          description: dto.description,
          provider: dto.externalProvider || 'default_provider',
        });

        if (externalResult.success) {
          savedTransaction.status = TransactionStatus.COMPLETED;
          savedTransaction.externalReference = externalResult.externalReference;
          await manager.save(Transaction, savedTransaction);

          await this.invalidateUserTransactionsCache(fromWallet.userId);
        } else {
          savedTransaction.status = TransactionStatus.FAILED;
          await manager.save(Transaction, savedTransaction);
          throw new BadRequestException(externalResult.message || 'External transaction failed');
        }

        return savedTransaction;
      } catch (error) {
        savedTransaction.status = TransactionStatus.FAILED;
        await manager.save(Transaction, savedTransaction);
        throw error;
      }
    });
  }

  async findUserTransactions(userId: string, paginationDto: PaginationDto) {
    this.validateUuid(userId, 'User ID');

    const cacheKey = `user_transactions_${userId}_${paginationDto.page}_${paginationDto.limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionsRepository.findAndCount({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      relations: ['fromWallet', 'toWallet', 'fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const result = { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
    await this.cacheManager.set(cacheKey, result, 300);
    await this.registerUserTransactionCacheKey(userId, cacheKey);

    return result;
  }

  async getLastFiveTransactions(userId: string): Promise<Transaction[]> {
    this.validateUuid(userId, 'User ID');

    const cacheKey = `last_five_transactions_${userId}`;
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    if (cached) return cached;

    const transactions = await this.transactionsRepository.find({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      relations: ['fromWallet', 'toWallet', 'fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    await this.cacheManager.set(cacheKey, transactions, 300);
    await this.registerUserTransactionCacheKey(userId, cacheKey);

    return transactions;
  }

  async findById(id: string): Promise<Transaction> {
    this.validateUuid(id, 'Transaction ID');

    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['fromWallet', 'toWallet', 'fromUser', 'toUser'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionsRepository.findAndCount({
      relations: ['fromWallet', 'toWallet', 'fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ================= CACHE HELPERS =================
  private async invalidateUserTransactionsCache(userId: string) {
try {
  await this.cacheManager.del(`transactions_user_${userId}`);
} catch (err) {
  console.error('Error al invalidar cache:', err);
}

}


  private async registerUserTransactionCacheKey(userId: string, cacheKey: string): Promise<void> {
    try {
      const redisClient = (this.cacheManager.store as any).getClient();
      await redisClient.sadd(`user_cache_keys_${userId}`, cacheKey);
    } catch (err) {
      console.warn(`Error registering cache key for user ${userId}:`, (err as Error).message);
    }
  }

  // ================= UTILITIES =================
  private generateTransactionHash(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `TXH_${timestamp}_${random}`;
  }

  private validateUuid(id: string, fieldName = 'ID') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) throw new BadRequestException(`${fieldName} is required and must be a valid UUID.`);
  }
}
