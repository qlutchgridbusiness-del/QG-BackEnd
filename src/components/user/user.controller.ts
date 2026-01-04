// src/components/user/user.controller.ts
import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserProfileDto, UpdateUserProfileDto } from './create-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** View my profile */
  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiOkResponse({ type: UserProfileDto })
  getMe(@Req() req) {
    return this.userService.getById(req.user.id);
  }

  /** Edit my profile */
  @Put('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateMe(@Req() req, @Body() dto: UpdateUserProfileDto) {
    return this.userService.update(req.user.id, dto);
  }

  /** My orders (bookings) */
  @Get('me/bookings')
  @ApiOperation({ summary: 'Get my bookings / orders' })
  getMyBookings(@Req() req) {
    return this.userService.getMyBookings(req.user.id);
  }
}
