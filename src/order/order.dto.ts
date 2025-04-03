import {
  IsUUID,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { OrderType } from 'src/types/order';

export class CreateOrderDto {
  @IsEnum(OrderType)
  @IsNotEmpty()
  type: OrderType;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  price: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  units: number;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
