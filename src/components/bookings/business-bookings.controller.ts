// src/components/bookings/business-bookings.controller.ts

import {
  Controller,
  Get,
  Put,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { BookingService } from './bookings.service';
import { Booking } from './bookings.entity';

@ApiTags('Business Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-bookings')
export class BusinessBookingsController {
  constructor(private readonly bookingService: BookingService) {}

  // --------------------------------------------------
  // 1️⃣ Get all bookings for my business
  // --------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'Get bookings for my business' })
  @ApiOkResponse({
    description: 'List of bookings',
    type: [Booking],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getBusinessBookings(@Req() req) {
    return this.bookingService.getBookingsForBusinessOwner(req.user.id);
  }

  // --------------------------------------------------
  // 2️⃣ Accept booking
  // --------------------------------------------------
  @Put(':id/accept')
  @ApiOperation({ summary: 'Accept booking' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Booking accepted',
    type: Booking,
  })
  @ApiForbiddenResponse({ description: 'Not allowed' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  acceptBooking(@Req() req, @Param('id') id: string) {
    return this.bookingService.acceptBooking(req.user.id, id);
  }

  // --------------------------------------------------
  // 3️⃣ Reject booking
  // --------------------------------------------------
  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject booking' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'No slots available',
        },
      },
      required: ['reason'],
    },
  })
  @ApiOkResponse({
    description: 'Booking rejected',
    type: Booking,
  })
  rejectBooking(
    @Req() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.bookingService.rejectBooking(req.user.id, id, reason);
  }

  // --------------------------------------------------
  // 4️⃣ Mark booking completed
  // --------------------------------------------------
  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark booking as completed' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
  })
  @ApiOkResponse({
    description: 'Booking completed',
    type: Booking,
  })
  @ApiForbiddenResponse({ description: 'Invalid status transition' })
  completeBooking(@Req() req, @Param('id') id: string) {
    return this.bookingService.completeBooking(req.user.id, id);
  }
}
