import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Orders } from './order.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/user/user.entity';
import { CreateOrderDto } from './order.dto';
import { OrderType } from 'src/types/order';

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

    // 2. Check if same price is already listed for selling
    const samePricedOrder = await this.orderRepository.find({
      where: {
        type: OrderType.SELL,
        price: createOrderDto.price,
      },
    });

    if (
      samePricedOrder &&
      samePricedOrder.length &&
      createOrderDto.type === OrderType.SELL
    ) {
      throw new BadRequestException(
        `Order already exists with selling price ${createOrderDto.price}`,
      );
    }

    // 3. Create Order
    const order = this.orderRepository.create({
      ...createOrderDto,
      user,
      remainingUnits: createOrderDto.units,
    });
    const savedOrder = await this.orderRepository.save(order);

    // 4. Add order in queue to trigger background task that try to complete transaction
    await this.ordersQueue.add(
      'process-order',
      { order: savedOrder },
      { attempts: 3, backoff: 5000 },
    );

    // 5. Return order
    return savedOrder;
  }
}
