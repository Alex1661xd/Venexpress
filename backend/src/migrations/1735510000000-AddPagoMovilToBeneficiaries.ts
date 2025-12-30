import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPagoMovilToBeneficiaries1735510000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const beneficiariesTable = await queryRunner.getTable('beneficiaries');

    // Hacer accountNumber nullable si no lo es ya
    const accountNumberColumn = beneficiariesTable.findColumnByName('accountNumber');
    if (accountNumberColumn && !accountNumberColumn.isNullable) {
      await queryRunner.changeColumn(
        'beneficiaries',
        'accountNumber',
        new TableColumn({
          name: 'accountNumber',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // Hacer accountType nullable si no lo es ya
    const accountTypeColumn = beneficiariesTable.findColumnByName('accountType');
    if (accountTypeColumn && !accountTypeColumn.isNullable) {
      await queryRunner.changeColumn(
        'beneficiaries',
        'accountType',
        new TableColumn({
          name: 'accountType',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // Agregar columna isPagoMovil si no existe
    if (!beneficiariesTable.findColumnByName('isPagoMovil')) {
      await queryRunner.addColumn(
        'beneficiaries',
        new TableColumn({
          name: 'isPagoMovil',
          type: 'boolean',
          default: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios
    await queryRunner.dropColumn('beneficiaries', 'isPagoMovil');

    await queryRunner.changeColumn(
      'beneficiaries',
      'accountNumber',
      new TableColumn({
        name: 'accountNumber',
        type: 'varchar',
        isNullable: false,
      }),
    );

    await queryRunner.changeColumn(
      'beneficiaries',
      'accountType',
      new TableColumn({
        name: 'accountType',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}

