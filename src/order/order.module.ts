import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './order.entity';
import { Users } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orders, Users])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
