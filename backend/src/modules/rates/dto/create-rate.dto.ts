import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateRateDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  saleRate: number;
}

