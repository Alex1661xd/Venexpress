import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionStatus } from '../../../common/enums/transaction-status.enum';

@Entity('transaction_history')
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction)
  transaction: Transaction;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column('text', { nullable: true })
  note: string;

  @ManyToOne(() => User, { nullable: true })
  changedBy: User;

  @CreateDateColumn()
  changedAt: Date;
}

