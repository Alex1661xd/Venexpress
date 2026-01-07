import { IsNotEmpty, IsNumber, IsPositive, IsEnum } from 'class-validator';
import { RateType } from '../../../common/enums/rate-type.enum';

export class CreateRateDto {
  @IsNotEmpty()
  @IsEnum(RateType)
  rateType: RateType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  saleRate: number;
}

