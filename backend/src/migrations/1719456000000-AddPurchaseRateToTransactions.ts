import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseRateToTransactions1719456000000 implements MigrationInterface {
    name = 'AddPurchaseRateToTransactions1719456000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Agregar columnas como NULL primero
        await queryRunner.query(`ALTER TABLE "transactions" ADD "purchase_rate" decimal(10,4) NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "is_purchase_rate_set" boolean NOT NULL DEFAULT false`);
        
        // 2. Agregar columnas a exchange_rates
        await queryRunner.query(`ALTER TABLE "exchange_rates" ADD "purchase_rate" decimal(10,4) NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_rates" ADD "is_purchase_rate_final" boolean NOT NULL DEFAULT false`);
        
        // 3. Actualizar la columna rate a sale_rate
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "rateUsed" TO "sale_rate"`);
        await queryRunner.query(`ALTER TABLE "exchange_rates" RENAME COLUMN "rate" TO "sale_rate"`);
        
        // 4. Agregar comentarios
        await queryRunner.query(`COMMENT ON COLUMN "transactions"."purchase_rate" IS 'Tasa de compra usada para la transacción'`);
        await queryRunner.query(`COMMENT ON COLUMN "transactions"."is_purchase_rate_set" IS 'Indica si se ha establecido la tasa de compra'`);
        await queryRunner.query(`COMMENT ON COLUMN "exchange_rates"."purchase_rate" IS 'Tasa de compra'`);
        await queryRunner.query(`COMMENT ON COLUMN "exchange_rates"."is_purchase_rate_final" IS 'Indica si la tasa de compra está confirmada'`);
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