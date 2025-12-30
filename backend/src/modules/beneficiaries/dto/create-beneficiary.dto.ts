import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateBeneficiaryDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  documentId: string;

  @IsNotEmpty()
  @IsString()
  bankName: string; // Nombre del banco o código para pago móvil

  @IsOptional()
  @IsString()
  accountNumber?: string; // Requerido solo si no es pago móvil

  @IsOptional()
  @IsString()
  accountType?: string; // Requerido solo si no es pago móvil

  @IsOptional()
  @IsString()
  phone?: string; // Requerido si es pago móvil

  @IsOptional()
  @IsBoolean()
  isPagoMovil?: boolean; // Default false

  @IsNotEmpty()
  @IsNumber()
  clientColombiaId: number;
}

