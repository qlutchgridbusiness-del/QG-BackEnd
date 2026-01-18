import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Booking } from 'src/components/bookings/bookings.entity';

@Injectable()
export class WhatsappService {
  private readonly url = process.env.META_API;

  async notifyUser(
    booking: Booking,
    event: 'BOOKING_CREATED' | 'BOOKING_ACCEPTED' | 'SERVICE_COMPLETED',
  ) {
    let message = '';

    switch (event) {
      case 'BOOKING_CREATED':
        message = `🧾 Booking ${booking.id} created successfully.`;
        break;

      case 'BOOKING_ACCEPTED':
        message = `✅ Your booking ${booking.id} has been accepted.`;
        break;

      case 'SERVICE_COMPLETED':
        message = `🔧 Service completed for booking ${booking.id}. Please pay online and collect your vehicle.`;
        break;
    }

    await axios.post(
      this.url,
      {
        messaging_product: 'whatsapp',
        to: booking.user.phone,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
