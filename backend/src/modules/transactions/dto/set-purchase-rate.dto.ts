import { IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SetPurchaseRateDto {
  @IsNumber()
  @Type(() => Number)
  purchaseRate: number;

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
}
