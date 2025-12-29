import { IsString, IsEmail, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CreateVendorDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10)
    phone: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsNumber()
    @IsOptional()
    pointId?: number;

    @IsNumber()
    @IsOptional()
    initialDebt?: number;
}
