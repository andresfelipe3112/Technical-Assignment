import { beforeEach, describe, it, expect, vi } from 'vitest';
import { TransactionsService } from '../transactions.service';
import { TransactionType, TransactionStatus } from '../emuns/transaction.enums';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// justo arriba de todos los imports
vi.mock('../entities/transaction.entity', () => ({
  Transaction: class MockTransaction {},
}));
vi.mock('../../wallets/entities/wallet.entity', () => ({
  Wallet: class MockWallet {},
}));


describe('TransactionsService', () => {
  let service: TransactionsService;
  let repo: any;
  let walletsService: any;
  let externalProvider: any;
  let cacheManager: any;
  let dataSource: any;

  beforeEach(() => {
    repo = {
      create: vi.fn((t: any) => t),
      save: vi.fn(async (t: any) => ({ ...t, id: 'tx123' })),
      findAndCount: vi.fn(async () => [[], 0]),
      findOne: vi.fn(),
      find: vi.fn(),
    };

    walletsService = {
      findByUserId: vi.fn(),
      findByWalletId: vi.fn(),
      findByWalletNumber: vi.fn(),
      createWallet: vi.fn(async (userId: string) => ({ id: 'w2', userId, balance: 0 })),
      transferBalance: vi.fn(async () => undefined),
    };

    externalProvider = {
      processExternalTransfer: vi.fn(async () => ({ success: true, externalReference: 'ext123' })),
    };

    cacheManager = {
      get: vi.fn(async () => null),
      set: vi.fn(async () => undefined),
      del: vi.fn(async () => undefined),
      store: { getClient: vi.fn(() => ({ sadd: vi.fn() })) },
    };

    dataSource = {
      transaction: vi.fn(async (fn: any) => fn({ save: async (t: any) => t })),
    };

    service = new TransactionsService(
      repo,
      walletsService,
      externalProvider,
      dataSource,
      cacheManager,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUuid throws for invalid UUID', () => {
    expect(() => service['validateUuid']('123', 'Test ID')).toThrow(BadRequestException);
  });


it('creates internal transaction', async () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const dto = { amount: 100, description: 'test', type: TransactionType.INTERNAL, toWalletNumber: 'wallet123' };

  const walletId = uuidv4(); // UUID válido

  walletsService.findByUserId.mockResolvedValue([{ id: walletId, userId, balance: 500 }]);
  walletsService.findByWalletNumber.mockResolvedValue({ id: uuidv4(), userId: 'other', balance: 0 });
  walletsService.findByWalletId.mockResolvedValue({ id: walletId, userId, balance: 500 });

  const tx = await service.createTransaction(userId, dto);

  expect(tx).toBeDefined();
  expect(tx.id).toBe(undefined);
  expect(walletsService.transferBalance).toHaveBeenCalledWith(walletId, expect.any(String), 100);
});

it('creates external transaction', async () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const dto = { amount: 50, description: 'external', type: TransactionType.EXTERNAL, toWalletNumber: 'addr123', externalProvider: 'prov' };

  const walletId = uuidv4(); // UUID válido

  walletsService.findByUserId.mockResolvedValue([{ id: walletId, userId, balance: 500 }]);
  walletsService.findByWalletId.mockResolvedValue({ id: walletId, userId, balance: 500 });

  const tx = await service.createTransaction(userId, dto);

  expect(tx.status).toBe(TransactionStatus.COMPLETED);
  expect(tx.externalReference).toBe('ext123');
  expect(externalProvider.processExternalTransfer).toHaveBeenCalled();
});

});
