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

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  total_units: number;

  @Column({ type: 'int' })
  remaining_units: number;

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
