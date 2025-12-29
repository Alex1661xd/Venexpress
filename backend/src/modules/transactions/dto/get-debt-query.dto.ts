import { IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum DebtPeriod {
    TODAY = 'today',
    LAST_15_DAYS = 'last15days',
    THIS_MONTH = 'thisMonth',
    CUSTOM = 'custom',
}

export class GetDebtQueryDto {
    @IsOptional()
    @IsEnum(DebtPeriod)
    period?: DebtPeriod;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
