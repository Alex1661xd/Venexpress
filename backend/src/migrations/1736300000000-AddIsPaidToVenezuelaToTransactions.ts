import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsPaidToVenezuelaToTransactions1736300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const transactionsTable = await queryRunner.getTable('transactions');

    if (!transactionsTable.findColumnByName('is_paid_to_venezuela')) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'is_paid_to_venezuela',
          type: 'boolean',
          default: false,
          comment: 'Indica si la deuda de esta transacción ya fue pagada a Admin Venezuela',
        }),
      );
    }

    if (!transactionsTable.findColumnByName('paid_to_venezuela_at')) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'paid_to_venezuela_at',
          type: 'timestamptz',
          isNullable: true,
          comment: 'Fecha en que se marcó como pagada a Venezuela',
        }),
      );
    }

    // Crear índice para mejorar las consultas
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_is_paid_to_venezuela 
      ON transactions(is_paid_to_venezuela) 
      WHERE is_paid_to_venezuela = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const transactionsTable = await queryRunner.getTable('transactions');

    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_is_paid_to_venezuela`);

    if (transactionsTable.findColumnByName('paid_to_venezuela_at')) {
      await queryRunner.dropColumn('transactions', 'paid_to_venezuela_at');
    }

    if (transactionsTable.findColumnByName('is_paid_to_venezuela')) {
      await queryRunner.dropColumn('transactions', 'is_paid_to_venezuela');
    }
  }
}

