import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/user/user.entity';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './user.dto';
import { Orders } from 'src/order/order.entity';
import { OrderStatus } from 'src/types/order';
import { Transactions } from 'src/transaction/transaction.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Orders)
    private readonly ordersReposiory: Repository<Orders>,
    @InjectRepository(Transactions)
    private readonly transactionReposiory: Repository<Transactions>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    // 1. Check if user already exists
    const exists = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (exists) {
      throw new BadRequestException('Email already exists');
    }
    // 2. Create user
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async getOrders(userId: string): Promise<Orders[]> {
    // 1. Check if user exists
    const exists = await this.userRepository.findOne({
      where: { userId },
    });
    if (!exists) {
      throw new BadRequestException('User not found');
    }

    // 2. Get PENDING and COMPLETED orders
    const orders = await this.ordersReposiory.find({
      relations: ['user'],
      where: {
        status: In([OrderStatus.PENDING, OrderStatus.COMPLETED]),
        user: {
          userId,
        },
      },
    });

    return orders;
  }

  async getTransactions(userId: string): Promise<Transactions[]> {
    // 1. Check if user exists
    const exists = await this.userRepository.findOne({
      where: { userId },
    });
    if (!exists) {
      throw new BadRequestException('User not found');
    }

    // 2. Get all transactions of the user
    const transactions = await this.transactionReposiory
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.buyerOrder', 'buyerOrder')
      .leftJoinAndSelect('buyerOrder.user', 'buyerUser')
      .leftJoinAndSelect('transaction.sellerOrder', 'sellerOrder')
      .leftJoinAndSelect('sellerOrder.user', 'sellerUser')
      .where('buyerUser.userId = :userId', { userId })
      .orWhere('sellerUser.userId = :userId', { userId })
      .getMany();

    return transactions;
  }
}
