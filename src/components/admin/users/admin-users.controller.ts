import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { AdminUserDto } from './admin-users.dto';
import { AdminActionResponseDto } from '../dto/admin-response.dto';
import { BasicAuthGuard } from 'src/components/auth/basic-auth.guard';

@ApiTags('Admin – Users')
@UseGuards(BasicAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ type: [AdminUserDto] })
  listUsers() {
    return this.service.listUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: AdminUserDto })
  getUser(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block user' })
  @ApiOkResponse({ type: AdminActionResponseDto })
  blockUser(@Param('id') id: string) {
    return this.service.blockUser(id);
  }
}
