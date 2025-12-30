import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBeneficiaryIsPagoMovilToTransactions1735520000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const transactionsTable = await queryRunner.getTable('transactions');
    
    if (!transactionsTable.findColumnByName('beneficiaryIsPagoMovil')) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'beneficiaryIsPagoMovil',
          type: 'boolean',
          isNullable: true,
          default: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'beneficiaryIsPagoMovil');
  }
}

