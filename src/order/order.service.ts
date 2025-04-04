import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Orders } from './order.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/user/user.entity';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectQueue('ordersQueue') private ordersQueue: Queue,
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Orders> {
    // 1. Check if user exists
    const user = await this.userRepository.findOne({
      where: {
        userId: createOrderDto.userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 2. Create Order
    const order = this.orderRepository.create({
      ...createOrderDto,
      user,
      remainingUnits: createOrderDto.units,
    });

    // 3. Add order in queue to trigger background task that try to complete transaction
    await this.ordersQueue.add(
      'process-order',
      { order },
      { attempts: 3, backoff: 5000 },
    );

    // 4. Return order
    return await this.orderRepository.save(order);
  }
}
