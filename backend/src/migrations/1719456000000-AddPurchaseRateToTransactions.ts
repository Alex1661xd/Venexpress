import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseRateToTransactions1719456000000 implements MigrationInterface {
    name = 'AddPurchaseRateToTransactions1719456000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const transactionsTable = await queryRunner.getTable('transactions');
        const exchangeRatesTable = await queryRunner.getTable('exchange_rates');

        // 1. Agregar columnas a transactions si no existen
        if (!transactionsTable.findColumnByName('purchase_rate')) {
            await queryRunner.query(`ALTER TABLE "transactions" ADD "purchase_rate" decimal(10,4) NULL`);
        }
        if (!transactionsTable.findColumnByName('is_purchase_rate_set')) {
            await queryRunner.query(`ALTER TABLE "transactions" ADD "is_purchase_rate_set" boolean NOT NULL DEFAULT false`);
        }
        
        // 2. Agregar columnas a exchange_rates si no existen
        if (!exchangeRatesTable.findColumnByName('purchase_rate')) {
            await queryRunner.query(`ALTER TABLE "exchange_rates" ADD "purchase_rate" decimal(10,4) NULL`);
        }
        if (!exchangeRatesTable.findColumnByName('is_purchase_rate_final')) {
            await queryRunner.query(`ALTER TABLE "exchange_rates" ADD "is_purchase_rate_final" boolean NOT NULL DEFAULT false`);
        }
        
        // 3. Renombrar columnas solo si existen y no han sido renombradas
        if (transactionsTable.findColumnByName('rateUsed') && !transactionsTable.findColumnByName('sale_rate')) {
            await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "rateUsed" TO "sale_rate"`);
        }
        if (exchangeRatesTable.findColumnByName('rate') && !exchangeRatesTable.findColumnByName('sale_rate')) {
            await queryRunner.query(`ALTER TABLE "exchange_rates" RENAME COLUMN "rate" TO "sale_rate"`);
        }
        
        // 4. Agregar comentarios (si no existen ya)
        try {
            await queryRunner.query(`COMMENT ON COLUMN "transactions"."purchase_rate" IS 'Tasa de compra usada para la transacción'`);
        } catch (e) {
            // Comentario ya existe, ignorar
        }
        try {
            await queryRunner.query(`COMMENT ON COLUMN "transactions"."is_purchase_rate_set" IS 'Indica si se ha establecido la tasa de compra'`);
        } catch (e) {
            // Comentario ya existe, ignorar
        }
        try {
            await queryRunner.query(`COMMENT ON COLUMN "exchange_rates"."purchase_rate" IS 'Tasa de compra'`);
        } catch (e) {
            // Comentario ya existe, ignorar
        }
        try {
            await queryRunner.query(`COMMENT ON COLUMN "exchange_rates"."is_purchase_rate_final" IS 'Indica si la tasa de compra está confirmada'`);
        } catch (e) {
            // Comentario ya existe, ignorar
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir los cambios en orden inverso
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "sale_rate" TO "rateUsed"`);
        await queryRunner.query(`ALTER TABLE "exchange_rates" RENAME COLUMN "sale_rate" TO "rate"`);
        
        await queryRunner.query(`ALTER TABLE "exchange_rates" DROP COLUMN "is_purchase_rate_final"`);
        await queryRunner.query(`ALTER TABLE "exchange_rates" DROP COLUMN "purchase_rate"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "is_purchase_rate_set"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "purchase_rate"`);
    }
}