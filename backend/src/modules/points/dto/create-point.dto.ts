import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePointDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

