import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Booking } from 'src/components/bookings/bookings.entity';

type WhatsAppEvent =
  | 'BOOKING_CREATED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'PAYMENT_COMPLETED'
  | 'VEHICLE_DELIVERED';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly url = process.env.META_API!;

  async notifyUser(booking: Booking, event: WhatsAppEvent): Promise<void> {
    const phone = booking.user?.phone;

    if (!phone) {
      this.logger.warn(`No phone number found for booking ${booking.id}`);
      return;
    }

    const message = this.buildMessage(event, booking);

    try {
      await axios.post(
        this.url,
        {
          messaging_product: 'whatsapp',
          to: `91${phone}`,
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
    } catch (err) {
      this.logger.error(
        `WhatsApp failed for booking ${booking.id}`,
        err?.response?.data || err.message,
      );
    }
  }

  async notifyBusiness(booking: Booking, event: WhatsAppEvent): Promise<void> {
    const phone = booking.business?.owner?.phone;
    if (!phone) {
      this.logger.warn(`No business phone for booking ${booking.id}`);
      return;
    }
    const message = this.buildBusinessMessage(event, booking);

    try {
      await axios.post(
        this.url,
        {
          messaging_product: 'whatsapp',
          to: `91${phone}`,
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
    } catch (err) {
      this.logger.error(
        `WhatsApp failed for booking ${booking.id}`,
        err?.response?.data || err.message,
      );
    }
  }

  // 🔒 Message builder (single responsibility)
  private buildMessage(event: WhatsAppEvent, booking: Booking): string {
    switch (event) {
      case 'BOOKING_CREATED':
        return `🧾 Your booking (${booking.id}) has been created successfully.`;

      case 'BOOKING_ACCEPTED':
        return `✅ Your booking (${booking.id}) has been accepted by ${booking.business.name}.`;
      case 'BOOKING_REJECTED':
        return `❌ Your booking (${booking.id}) was rejected by ${booking.business.name}.`;
      case 'BOOKING_CANCELLED':
        return `⚠️ Your booking (${booking.id}) was cancelled.`;

      case 'SERVICE_STARTED':
        return `🔧 Service has started for your booking (${booking.id}).`;

      case 'SERVICE_COMPLETED':
        return `✅ Service completed for booking (${booking.id}). Please pay online and collect your vehicle.`;

      case 'PAYMENT_COMPLETED':
        return `💳 Payment received for booking (${booking.id}). Thank you!`;

      case 'VEHICLE_DELIVERED':
        return `🚗 Vehicle delivered for booking (${booking.id}). Drive safe!`;

      default:
        return `📢 Update for your booking (${booking.id}).`;
    }
  }

  private buildBusinessMessage(event: WhatsAppEvent, booking: Booking): string {
    switch (event) {
      case 'BOOKING_CREATED':
        return `🧾 New booking (${booking.id}) received.`;
      case 'BOOKING_ACCEPTED':
        return `✅ Booking (${booking.id}) accepted.`;
      case 'BOOKING_REJECTED':
        return `❌ Booking (${booking.id}) rejected.`;
      case 'SERVICE_STARTED':
        return `🔧 Service started for booking (${booking.id}).`;
      case 'SERVICE_COMPLETED':
        return `✅ Service completed for booking (${booking.id}). Payment pending.`;
      case 'BOOKING_CANCELLED':
        return `⚠️ Booking (${booking.id}) cancelled by user.`;
      case 'PAYMENT_COMPLETED':
        return `💳 Payment received for booking (${booking.id}). Ready for delivery.`;
      case 'VEHICLE_DELIVERED':
        return `🚗 Vehicle delivered for booking (${booking.id}).`;
      default:
        return `📢 Update for booking (${booking.id}).`;
    }
  }
}
