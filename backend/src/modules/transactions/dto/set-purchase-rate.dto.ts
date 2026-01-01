import { IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SetPurchaseRateDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  purchaseRate?: number; // Opcional para permitir eliminar la tasa

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFinal?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  transactionIds?: number[];

  @IsOptional()
  date?: string; // Formato: YYYY-MM-DD

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  removeRate?: boolean; // Si es true, elimina la tasa de compra
}
