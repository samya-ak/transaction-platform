import { Orders } from 'src/order/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn('uuid', { name: 'transaction_id' })
  transactionId: string;

  @ManyToOne(() => Orders, { nullable: false })
  @JoinColumn({ name: 'buyer_order_id' })
  buyerOrder: Orders;

  @ManyToOne(() => Orders, { nullable: false })
  @JoinColumn({ name: 'seller_order_id' })
  sellerOrder: Orders;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  units: number;
}
