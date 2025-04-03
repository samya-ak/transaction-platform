import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';
import { Orders } from './order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body(new ValidationPipe()) order: CreateOrderDto,
  ): Promise<Orders> {
    return this.orderService.createOrder(order);
  }
}
