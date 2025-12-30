import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddVenezuelaPayments1735500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('venezuela_payments');
    
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'venezuela_payments',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'amount',
              type: 'decimal',
              precision: 12,
              scale: 2,
            },
            {
              name: 'notes',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'proofUrl',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'createdById',
              type: 'int',
            },
            {
              name: 'createdAt',
              type: 'timestamptz',
              default: 'now()',
            },
            {
              name: 'paymentDate',
              type: 'timestamptz',
            },
          ],
        }),
        true,
      );

      // Add foreign key to users table
      await queryRunner.createForeignKey(
        'venezuela_payments',
        new TableForeignKey({
          columnNames: ['createdById'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('venezuela_payments');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('createdById') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('venezuela_payments', foreignKey);
    }
    await queryRunner.dropTable('venezuela_payments');
  }
}

