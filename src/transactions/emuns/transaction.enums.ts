import { registerEnumType } from '@nestjs/graphql';

export enum TransactionType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(TransactionType, { name: 'TransactionType' });
registerEnumType(TransactionStatus, { name: 'TransactionStatus' });
