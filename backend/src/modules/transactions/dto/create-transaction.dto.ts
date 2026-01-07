import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, IsEnum } from 'class-validator';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  beneficiaryId: number;

  @IsOptional()
  @IsNumber()
  clientPresencialId?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ValidateIf((o) => o.transactionType === TransactionType.NORMAL || !o.transactionType)
  @ValidateIf((o) => !o.amountBs && !o.amountUSD)
  @IsNumber()
  amountCOP?: number;

  @ValidateIf((o) => o.transactionType && o.transactionType !== TransactionType.NORMAL)
  @ValidateIf((o) => !o.amountBs && !o.amountCOP)
  @IsNumber()
  amountUSD?: number;

  @ValidateIf((o) => !o.amountCOP && !o.amountUSD)
  @IsNotEmpty()
  @IsNumber()
  amountBs?: number;

  @IsOptional()
  @IsString()
  comprobanteCliente?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  customRate?: number;
}

