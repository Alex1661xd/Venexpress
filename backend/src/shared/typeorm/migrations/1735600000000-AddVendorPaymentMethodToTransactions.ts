import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVendorPaymentMethodToTransactions1735600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('transactions');

        if (!table) {
            return;
        }

        // Check if column already exists
        if (!table.findColumnByName('vendor_payment_method')) {
            await queryRunner.addColumn(
                'transactions',
                new TableColumn({
                    name: 'vendor_payment_method',
                    type: 'enum',
                    enum: ['efectivo', 'consignacion_nequi', 'consignacion_bancolombia'],
                    isNullable: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('transactions');
        if (table && table.findColumnByName('vendor_payment_method')) {
            await queryRunner.dropColumn('transactions', 'vendor_payment_method');
        }
    }
}

