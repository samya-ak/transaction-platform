import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not, In } from 'typeorm';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Orders } from './order.entity';
import { OrderStatus, OrderType } from 'src/types/order';
import { Transactions } from 'src/transaction/transaction.entity';

interface OrderJob {
  order: Orders;
}

@Injectable()
@Processor('ordersQueue')
export class OrderProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
  ) {
    super();
  }

  async process(job: Job<OrderJob, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-order':
        const order = job.data.order;

        const updatedOrders: Orders[] = [];
        const newTransactions: Omit<Transactions, 'transactionId'>[] = [];

        const queryRunner =
          this.orderRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
          if (order.type === OrderType.BUY.toString()) {
            await this.processOrder(
              order,
              order.type,
              updatedOrders,
              newTransactions,
            );
          } else {
            await this.processOrder(
              order,
              order.type,
              updatedOrders,
              newTransactions,
            );
          }

          // Bulk update orders inside the transaction
          await queryRunner.manager.save(Orders, updatedOrders);
          // Bulk insert new transactions inside the transaction
          await queryRunner.manager.save(Transactions, newTransactions);
          // Commit transaction
          await queryRunner.commitTransaction();
          console.log('Order processed successfully', job.data);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('Error processing order:', error);
        } finally {
          await queryRunner.release();
        }

        break;
    }
  }

  private async processOrder(
    order: Orders,
    orderType: OrderType,
    updatedOrders: Orders[],
    newTransactions: Omit<Transactions, 'transactionId'>[],
  ): Promise<void> {
    let totalUnits = order.units;

    // When buying, fetch orders to be sold whose price is less than or equal to buying price
    // When selling, fetch orders to be bought whose price is greater than or equal to selling price
    // Match only order created by other users
    const matchingOrders = await this.orderRepository.find({
      relations: ['user'],
      where: {
        type: orderType === OrderType.BUY ? OrderType.SELL : OrderType.BUY,
        price:
          orderType === OrderType.BUY
            ? LessThanOrEqual(order.price)
            : MoreThanOrEqual(order.price),
        status: In([OrderStatus.PENDING, OrderStatus.PARTIALLY_COMPLETED]),
        user: {
          userId: Not(order.user.userId),
        },
      },
      order: {
        price: 'ASC',
      },
    });

    for (const match of matchingOrders) {
      if (totalUnits === 0) break;

      const remainingUnits = match.remainingUnits - totalUnits;
      const unitsToProcess = totalUnits;

      // Remaining units to process for next cycle
      if (match.remainingUnits > totalUnits) {
        totalUnits = 0;
      } else {
        totalUnits = totalUnits - match.remainingUnits;
      }

      updatedOrders.push({
        ...match,
        remainingUnits: remainingUnits > 0 ? remainingUnits : 0,
        status:
          remainingUnits <= 0
            ? OrderStatus.COMPLETED
            : OrderStatus.PARTIALLY_COMPLETED,
      });

      newTransactions.push({
        sellerOrder: orderType === OrderType.BUY ? match : order,
        buyerOrder: orderType === OrderType.BUY ? order : match,
        price: Math.min(match.price, order.price),
        units: Math.min(unitsToProcess, match.remainingUnits),
      });
    }

    updatedOrders.push({
      ...order,
      remainingUnits: totalUnits,
      status:
        totalUnits <= 0
          ? OrderStatus.COMPLETED
          : OrderStatus.PARTIALLY_COMPLETED,
    });
  }
}
