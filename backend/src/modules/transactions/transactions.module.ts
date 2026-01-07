import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionHistory } from './entities/transaction-history.entity';
import { Beneficiary } from '../beneficiaries/entities/beneficiary.entity';
import { VenezuelaPayment } from './entities/venezuela-payment.entity';
import { Account } from '../accounts/entities/account.entity';
import { AccountTransaction } from '../accounts/entities/account-transaction.entity';
import { RatesModule } from '../rates/rates.module';
import { ProofsModule } from '../proofs/proofs.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionHistory, Beneficiary, VenezuelaPayment, Account, AccountTransaction]),
    RatesModule,
    ProofsModule,
    AccountsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }

