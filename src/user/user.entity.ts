import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from 'src/order/order.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
  })
  firstname: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
  })
  lastname: string;

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[];
}
