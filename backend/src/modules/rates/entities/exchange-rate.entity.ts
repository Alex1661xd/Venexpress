import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RateType } from '../../../common/enums/rate-type.enum';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RateType,
    default: RateType.ACTUAL,
    name: 'rate_type',
  })
  rateType: RateType; // Tipo de tasa (actual, paypal, zelle, dolares, banco_central)

  @Column('decimal', { precision: 10, scale: 4, name: 'sale_rate' })
  saleRate: number; // Tasa de venta (obligatoria)

  @Column('decimal', { precision: 10, scale: 4, name: 'purchase_rate', nullable: true })
  purchaseRate: number; // Tasa de compra (opcional)

  @Column({ name: 'is_purchase_rate_final', default: false })
  isPurchaseRateFinal: boolean; // Indica si la tasa de compra está confirmada

  @ManyToOne(() => User)
  createdBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

