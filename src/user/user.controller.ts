import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { Users } from './user.entity';
import { Orders } from 'src/order/order.entity';
import { Transactions } from 'src/transaction/transaction.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body(new ValidationPipe()) user: CreateUserDto,
  ): Promise<Users> {
    return this.userService.createUser(user);
  }

  @Get(':userId/orders')
  async getUserOrders(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<Orders[]> {
    return this.userService.getOrders(userId);
  }

  @Get(':userId/transactions')
  async getUserTransactions(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<Transactions[]> {
    return this.userService.getTransactions(userId);
  }
}
