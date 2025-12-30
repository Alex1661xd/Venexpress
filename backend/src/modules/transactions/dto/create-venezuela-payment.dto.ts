import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVenezuelaPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;
}

