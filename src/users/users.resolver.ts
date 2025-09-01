import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@Context() context: any) {
    return context.req.user;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  user(@Args('id') id: string) {
    return this.usersService.findById(id);
  }
}
