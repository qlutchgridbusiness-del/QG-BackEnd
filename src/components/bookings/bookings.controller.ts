import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './bookings.dto';
import { BookingStatus } from './bookings.entity';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking order (no payment flow)' })
  @ApiBody({ type: CreateBookingDto })
  createBooking(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  getAll() {
    return this.bookings.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  getBooking(@Param('id') id: string) {
    return this.bookings.getById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status (e.g., pending → completed)' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookings.updateStatus(id, body.status);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Request booking reschedule' })
  reschedule(@Param('id') id: string, @Body() body: { newDate: string }) {
    return this.bookings.requestReschedule(id, body.newDate);
  }

  @Post(':id/upload-pre-service')
  @ApiOperation({ summary: 'Upload pre-service image (before service starts)' })
  uploadPreService(
    @Param('id') id: string,
    @Body() body: { imageUrl: string },
  ) {
    return this.bookings.uploadPreServiceImage(id, body.imageUrl);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark booking as completed with proof image' })
  markCompleted(
    @Param('id') id: string,
    @Body() body: { completionUrl: string },
  ) {
    return this.bookings.markCompleted(id, body.completionUrl);
  }
}
