
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(user.id, createTransactionDto);
  }

  @Get('my-transactions')
  getMyTransactions(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.transactionsService.findUserTransactions(user.id, paginationDto);
  }

  @Get('my-recent')
  getMyRecentTransactions(@CurrentUser() user: User) {
    return this.transactionsService.getLastFiveTransactions(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.transactionsService.findAll(paginationDto);
  }
}