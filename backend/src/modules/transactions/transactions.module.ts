import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionHistory } from './entities/transaction-history.entity';
import { Beneficiary } from '../beneficiaries/entities/beneficiary.entity';
import { VenezuelaPayment } from './entities/venezuela-payment.entity';
import { RatesModule } from '../rates/rates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionHistory, Beneficiary, VenezuelaPayment]),
    RatesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }

