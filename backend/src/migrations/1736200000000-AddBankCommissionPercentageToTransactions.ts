import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBankCommissionPercentageToTransactions1736200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const transactionsTable = await queryRunner.getTable('transactions');

    if (!transactionsTable.findColumnByName('bank_commission_percentage')) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'bank_commission_percentage',
          type: 'decimal',
          precision: 5,
          scale: 2,
          isNullable: true,
          comment: 'Porcentaje de comisión bancaria cobrada al completar la transferencia (ej: 3%)',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const transactionsTable = await queryRunner.getTable('transactions');

    if (transactionsTable.findColumnByName('bank_commission_percentage')) {
      await queryRunner.dropColumn('transactions', 'bank_commission_percentage');
    }
  }
}

