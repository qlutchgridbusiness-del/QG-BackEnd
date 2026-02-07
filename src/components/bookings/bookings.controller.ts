// src/components/bookings/bookings.controller.ts
import { Controller, Post, Body, Req, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './bookings.service';
import { CreateBookingDto } from './bookings.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create booking (user)' })
  create(@Req() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings' })
  getMyBookings(@Req() req) {
    return this.bookingService.getMyBookings(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get my booking details' })
  getMyBooking(@Req() req, @Param('id') id: string) {
    return this.bookingService.getMyBookingById(req.user.id, id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(@Req() req, @Param('id') id: string) {
    return this.bookingService.cancelBooking(req.user.id, id);
  }

  @Post(':id/pickup-request')
  @ApiOperation({ summary: 'User requests vehicle pickup' })
  pickupRequest(@Req() req, @Param('id') id: string) {
    return this.bookingService.requestPickup(req.user.id, id);
  }
}
