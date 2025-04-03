import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './order.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/user/user.entity';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
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

    // 3. Return order
    return await this.orderRepository.save(order);
  }
}
