import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { Orders } from 'src/order/order.entity';
import { Transactions } from 'src/transaction/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Orders, Transactions])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
