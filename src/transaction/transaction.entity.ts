import { Orders } from 'src/order/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Orders, { nullable: false })
  @JoinColumn({ name: 'buyer_order_id' })
  buyer_order: Orders;

  @OneToOne(() => Orders, { nullable: false })
  @JoinColumn({ name: 'seller_order_id' })
  seller_order: Orders;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  units: number;
}
