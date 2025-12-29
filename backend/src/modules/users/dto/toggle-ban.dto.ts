import { IsBoolean } from 'class-validator';

export class ToggleBanDto {
    @IsBoolean()
    isBanned: boolean;
}
