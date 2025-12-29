import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTransactionDto {
    @IsOptional()
    @IsNumber()
    beneficiaryId?: number;

    @IsOptional()
    @IsNumber()
    amountCOP?: number;

    @IsOptional()
    @IsNumber()
    amountBs?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
