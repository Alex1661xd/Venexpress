import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';

@Entity('beneficiaries')
export class Beneficiary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  documentId: string;

  @Column()
  bankName: string;

  @Column()
  accountNumber: string;

  @Column()
  accountType: string; // ahorro, corriente

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Client, { nullable: true })
  clientColombia: Client;

  @ManyToOne(() => User, { nullable: true })
  userApp: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

