import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Resolver(() => Transaction)
@UseGuards(GqlAuthGuard)
export class TransactionsResolver {
  constructor(private transactionsService: TransactionsService) {}

  @Mutation(() => Transaction)
  createTransaction(
    @Args('createTransactionInput') createTransactionDto: CreateTransactionDto,
    @Context() context: any,
  ) {
    const userId = context.req.user.id;
    return this.transactionsService.createTransaction(userId, createTransactionDto);
  }

  @Query(() => [Transaction])
  myRecentTransactions(@Context() context: any) {
    const userId = context.req.user.id;
    return this.transactionsService.getLastFiveTransactions(userId);
  }

  @Query(() => Transaction)
  transaction(@Args('id') id: string) {
    return this.transactionsService.findById(id);
  }
}
