import { Controller, Get, Put, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@Request() req: any, @Body() body: { name?: string; phone?: string; avatar?: string }) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  getAddresses(@Request() req: any) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Add new address' })
  addAddress(@Request() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user.id, body);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get user order history' })
  getOrders(@Request() req: any) {
    return this.usersService.getOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
