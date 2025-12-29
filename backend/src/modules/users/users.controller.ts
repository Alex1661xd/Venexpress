import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles(UserRole.ADMIN_COLOMBIA)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Admin Colombia endpoints
  @Get('vendors')
  @Roles(UserRole.ADMIN_COLOMBIA)
  findAllVendors() {
    return this.usersService.findAllVendors();
  }

  @Post('vendors')
  @Roles(UserRole.ADMIN_COLOMBIA)
  createVendor(@Body() createVendorDto: any) {
    return this.usersService.createVendor(createVendorDto);
  }

  @Get(':id/debt-details')
  @Roles(UserRole.ADMIN_COLOMBIA)
  getDebtDetails(@Param('id') id: string, @Query() query: any) {
    return this.usersService.getVendorDebtDetails(+id, query);
  }

  @Get(':id/transactions')
  @Roles(UserRole.ADMIN_COLOMBIA)
  getVendorTransactions(@Param('id') id: string, @Query() query: any) {
    return this.usersService.getVendorTransactions(+id, query);
  }

  @Get()
  @Roles(UserRole.ADMIN_COLOMBIA, UserRole.ADMIN_VENEZUELA)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_COLOMBIA)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN_COLOMBIA)
  changeRole(@Param('id') id: string, @Body() changeRoleDto: any) {
    return this.usersService.changeUserRole(+id, changeRoleDto.role);
  }

  @Patch(':id/ban')
  @Roles(UserRole.ADMIN_COLOMBIA)
  toggleBan(@Param('id') id: string, @Body() toggleBanDto: any) {
    return this.usersService.toggleBanUser(+id, toggleBanDto.isBanned);
  }
}

