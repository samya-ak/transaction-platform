import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { Users } from './user/user.entity';
import { Orders } from './order/order.entity';
import { TransactionModule } from './transaction/transaction.module';
import { Transactions } from './transaction/transaction.entity';
import { OrderModule } from './order/order.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configservice: ConfigService) => ({
        type: 'postgres',
        entities: [Users, Orders, Transactions],
        synchronize: true,
        host: configservice.get<string>('DB_HOST'),
        port: configservice.get<number>('DB_PORT'),
        username: configservice.get<string>('DB_USERNAME'),
        password: configservice.get<string>('DB_PASSWORD'),
        database: configservice.get<string>('DB_NAME'),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configservice: ConfigService) => ({
        connection: {
          host: configservice.get<string>('REDIS_HOST'),
          port: configservice.get<number>('REDIS_PORT'),
        },
      }),
    }),
    UserModule,
    OrderModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
