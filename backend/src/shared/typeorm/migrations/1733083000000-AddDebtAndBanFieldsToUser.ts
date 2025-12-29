import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDebtAndBanFieldsToUser1733083000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('users');

        if (!table) {
            return;
        }

        // Add debt field
        if (!table.findColumnByName('debt')) {
            await queryRunner.addColumn(
                'users',
                new TableColumn({
                    name: 'debt',
                    type: 'decimal',
                    precision: 12,
                    scale: 2,
                    default: 0,
                }),
            );
        }

        // Add paidAmount field
        if (!table.findColumnByName('paidAmount')) {
            await queryRunner.addColumn(
                'users',
                new TableColumn({
                    name: 'paidAmount',
                    type: 'decimal',
                    precision: 12,
                    scale: 2,
                    default: 0,
                }),
            );
        }

        // Add isBanned field
        if (!table.findColumnByName('isBanned')) {
            await queryRunner.addColumn(
                'users',
                new TableColumn({
                    name: 'isBanned',
                    type: 'boolean',
                    default: false,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'debt');
        await queryRunner.dropColumn('users', 'paidAmount');
        await queryRunner.dropColumn('users', 'isBanned');
    }
}
