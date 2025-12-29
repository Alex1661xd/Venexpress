import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  beneficiaryId: number;

  @IsOptional()
  @IsNumber()
  clientPresencialId?: number;

  @ValidateIf((o) => !o.amountBs)
  @IsNotEmpty()
  @IsNumber()
  amountCOP?: number;

  @ValidateIf((o) => !o.amountCOP)
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

