import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('venezuela_payments')
export class VenezuelaPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number; // Monto pagado en COP

  @Column('text', { nullable: true })
  notes: string; // Notas sobre el pago (número de referencia, etc)

  @Column({ nullable: true })
  proofUrl: string; // URL del comprobante de pago

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User; // Admin Colombia que registró el pago

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  paymentDate: Date; // Fecha en que se realizó el pago
}

