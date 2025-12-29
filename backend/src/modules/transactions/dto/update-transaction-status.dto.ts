import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '../../../common/enums/transaction-status.enum';

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  comprobanteVenezuela?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

