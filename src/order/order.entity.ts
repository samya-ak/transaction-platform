import { Users } from 'src/user/user.entity';
import { Transactions } from 'src/transaction/transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { OrderType, OrderStatus } from 'src/types/order';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  orderId: string;

  @Column({ type: 'int', name: 'total_units' })
  units: number;

  @Column({ type: 'int', name: 'remaining_units' })
  remainingUnits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ManyToOne(() => Users, (user) => user.orders, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToMany(() => Transactions, (transaction) => transaction.buyer_order)
  buyer_transactions: Transactions[];

  @OneToMany(() => Transactions, (transaction) => transaction.seller_order)
  seller_transactions: Transactions[];
}
