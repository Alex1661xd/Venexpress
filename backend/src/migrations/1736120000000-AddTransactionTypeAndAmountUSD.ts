import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTransactionTypeAndAmountUSD1736120000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el tipo enum en PostgreSQL (si no existe)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE transactions_transaction_type_enum AS ENUM ('normal', 'paypal', 'zelle', 'dolares');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Agregar la columna transaction_type (si no existe)
    const transactionTypeExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='transactions' and column_name='transaction_type'
    `);
    
    if (!transactionTypeExists || transactionTypeExists.length === 0) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'transaction_type',
          type: 'transactions_transaction_type_enum',
          default: "'normal'",
        }),
      );
    }

    // Agregar la columna amount_usd (nullable) (si no existe)
    const amountUsdExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='transactions' and column_name='amount_usd'
    `);
    
    if (!amountUsdExists || amountUsdExists.length === 0) {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'amount_usd',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // Modificar amount_cop para que sea nullable (para transacciones en USD)
    await queryRunner.query(`
      ALTER TABLE transactions ALTER COLUMN "amountCOP" DROP NOT NULL;
    `);

    // Crear índice para búsquedas más rápidas por tipo de transacción
    await queryRunner.query(`
      CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_transaction_type`);

    // Restaurar amount_cop como NOT NULL (solo si no hay datos que lo impidan)
    await queryRunner.query(`
      ALTER TABLE transactions ALTER COLUMN "amountCOP" SET NOT NULL;
    `);

    // Eliminar las columnas
    await queryRunner.dropColumn('transactions', 'amount_usd');
    await queryRunner.dropColumn('transactions', 'transaction_type');

    // Eliminar el tipo enum
    await queryRunner.query(`DROP TYPE IF EXISTS transactions_transaction_type_enum`);
  }
}

