import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RatesService } from './rates.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Post()
  @Roles(UserRole.ADMIN_VENEZUELA)
  create(@Body() createRateDto: CreateRateDto, @CurrentUser('id') userId: number) {
    return this.ratesService.create(createRateDto, userId);
  }

  @Public()
  @Get('current')
  getCurrentRate() {
    return this.ratesService.getCurrentRate();
  }

  @Get('all-current')
  @Roles(UserRole.ADMIN_COLOMBIA, UserRole.ADMIN_VENEZUELA, UserRole.VENDEDOR)
  getAllCurrentRates() {
    return this.ratesService.getAllCurrentRates();
  }

  @Get('history')
  @Roles(UserRole.ADMIN_COLOMBIA, UserRole.ADMIN_VENEZUELA)
  getHistory(@Query('limit') limit: number = 30) {
    return this.ratesService.getHistory(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratesService.findOne(+id);
  }
}

