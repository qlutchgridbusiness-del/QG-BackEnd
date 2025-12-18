import { Controller, Post, Body, Req } from '@nestjs/common';
import { BookingService } from './bookings.service';
import { CreateBookingDto } from './bookings.dto';
// import { AuthGuard } from '../auth/auth.guard';

@Controller('bookings')
// @UseGuards(AuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, dto);
  }
}
