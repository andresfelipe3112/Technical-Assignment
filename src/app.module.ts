import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST') ?? 'localhost',
        port: parseInt(configService.get<string>('DATABASE_PORT') ?? '5432', 10),
        username: configService.get<string>('DATABASE_USER') ?? 'postgres',
        password: configService.get<string>('DATABASE_PASSWORD') ?? 'postgres',
        database: configService.get<string>('DATABASE_NAME') ?? 'postgres',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
      }),
    }),

    // ✅ Cache global (IMPORTANTE: async no necesario, no await)
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore({
          url: configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
          database: 0,
        }),
        ttl: 600,
      })as any,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
    }),

    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
  ],
})
export class AppModule {}
