import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRateTypeToExchangeRates1736110000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el tipo enum en PostgreSQL
    await queryRunner.query(`
      CREATE TYPE exchange_rates_rate_type_enum AS ENUM ('actual', 'paypal', 'zelle', 'dolares', 'banco_central');
    `);

    // Agregar la columna rate_type a la tabla exchange_rates
    await queryRunner.addColumn(
      'exchange_rates',
      new TableColumn({
        name: 'rate_type',
        type: 'exchange_rates_rate_type_enum',
        default: "'actual'",
      }),
    );

    // Crear índice para búsquedas más rápidas por tipo de tasa
    await queryRunner.query(`
      CREATE INDEX idx_exchange_rates_rate_type ON exchange_rates(rate_type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar el índice
    await queryRunner.query(`DROP INDEX IF EXISTS idx_exchange_rates_rate_type`);

    // Eliminar la columna
    await queryRunner.dropColumn('exchange_rates', 'rate_type');

    // Eliminar el tipo enum
    await queryRunner.query(`DROP TYPE IF EXISTS exchange_rates_rate_type_enum`);
  }
}

