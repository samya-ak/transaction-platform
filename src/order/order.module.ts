import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './order.entity';
import { Users } from 'src/user/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { OrderProcessor } from './order.processor';
import { Transactions } from 'src/transaction/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, Users, Transactions]),
    BullModule.registerQueue({
      name: 'ordersQueue',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessor],
})
export class OrderModule {}
