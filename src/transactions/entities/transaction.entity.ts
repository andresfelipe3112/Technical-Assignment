import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { TransactionStatus, TransactionType } from '../emuns/transaction.enums';



@ObjectType()
@Entity('transactions')
export class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Field()
  @Column()
  description: string;

  @Field(() => TransactionType) 
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Field(() => TransactionStatus) 
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Field()
  @Column({ unique: true })
  transactionHash: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.sentTransactions)
  fromUser: User;

  @Column()
  fromUserId: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.receivedTransactions, { nullable: true })
  toUser?: User;

  @Column({ nullable: true })
  toUserId?: string;

  @Field(() => Wallet)
  @ManyToOne(() => Wallet, wallet => wallet.sentTransactions)
  fromWallet: Wallet;

  @Column()
  fromWalletId: string;

  @Field(() => Wallet, { nullable: true })
  @ManyToOne(() => Wallet, wallet => wallet.receivedTransactions, { nullable: true })
  toWallet?: Wallet;

  @Column({ nullable: true })
  toWalletId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  externalReference?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  externalProvider?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}


