// src/wallets/entities/wallet.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum WalletType {
  PERSONAL = 'personal',
  BUSINESS = 'business'
}

registerEnumType(WalletType, {
  name: 'WalletType', 
  description: 'Type of the wallet: personal or business',
});

@ObjectType()
@Entity('wallets')
export class Wallet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  walletNumber: string;

  @Field(() => Float)
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Field()
  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.PERSONAL
  })
  type: WalletType;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => User)
  @ManyToOne(() => User, user => user.wallets)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Transaction, transaction => transaction.fromWallet)
  sentTransactions: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.toWallet)
  receivedTransactions: Transaction[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}