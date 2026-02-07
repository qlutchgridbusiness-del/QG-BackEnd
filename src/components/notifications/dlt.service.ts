import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Booking } from 'src/components/bookings/bookings.entity';

type DltEvent =
  | 'BOOKING_CREATED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'SERVICE_STARTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'VEHICLE_DELIVERED';

@Injectable()
export class DltService {
  private readonly logger = new Logger(DltService.name);
  private readonly msg91Url =
    process.env.MSG91_FLOW_URL || 'https://control.msg91.com/api/v5/flow/';
  private readonly msg91AuthKey = process.env.MSG91_AUTH_KEY;
  private readonly webUrl =
    process.env.WEB_BASE_URL || 'https://qlutchgrid.com';

  private readonly templates = {
    BOOKING_CREATED:
      process.env.DLT_TEMPLATE_BOOKING_CREATED || '1007400680987746873',
    BOOKING_ACCEPTED:
      process.env.DLT_TEMPLATE_BOOKING_ACCEPTED || '1007799345212428828',
    BOOKING_REJECTED:
      process.env.DLT_TEMPLATE_BOOKING_REJECTED || '1007414538698307613',
    BOOKING_CANCELLED:
      process.env.DLT_TEMPLATE_BOOKING_CANCELLED || '1007907898041127491',
    PAYMENT_PENDING:
      process.env.DLT_TEMPLATE_PAYMENT_PENDING || '1007609333402572564',
    PAYMENT_COMPLETED:
      process.env.DLT_TEMPLATE_PAYMENT_COMPLETED || '1007625386586908131',
    SERVICE_COMPLETED:
      process.env.DLT_TEMPLATE_SERVICE_COMPLETED || '1007838706098083805',
    SERVICE_STARTED: process.env.DLT_TEMPLATE_SERVICE_STARTED,
    VEHICLE_DELIVERED: process.env.DLT_TEMPLATE_VEHICLE_DELIVERED,

    BUSINESS_BOOKING_CREATED:
      process.env.DLT_TEMPLATE_BUSINESS_BOOKING_CREATED ||
      process.env.DLT_TEMPLATE_BOOKING_CREATED ||
      '1007400680987746873',
    BUSINESS_BOOKING_ACCEPTED:
      process.env.DLT_TEMPLATE_BUSINESS_BOOKING_ACCEPTED ||
      process.env.DLT_TEMPLATE_BOOKING_ACCEPTED ||
      '1007799345212428828',
    BUSINESS_BOOKING_REJECTED:
      process.env.DLT_TEMPLATE_BUSINESS_BOOKING_REJECTED ||
      process.env.DLT_TEMPLATE_BOOKING_REJECTED ||
      '1007414538698307613',
    BUSINESS_SERVICE_STARTED:
      process.env.DLT_TEMPLATE_BUSINESS_SERVICE_STARTED ||
      process.env.DLT_TEMPLATE_SERVICE_STARTED,
    BUSINESS_SERVICE_COMPLETED:
      process.env.DLT_TEMPLATE_BUSINESS_SERVICE_COMPLETED ||
      process.env.DLT_TEMPLATE_SERVICE_COMPLETED ||
      process.env.DLT_TEMPLATE_PAYMENT_PENDING ||
      '1007609333402572564',
    BUSINESS_PAYMENT_COMPLETED:
      process.env.DLT_TEMPLATE_BUSINESS_PAYMENT_COMPLETED ||
      process.env.DLT_TEMPLATE_PAYMENT_COMPLETED ||
      '1007625386586908131',
    BUSINESS_VEHICLE_DELIVERED:
      process.env.DLT_TEMPLATE_BUSINESS_VEHICLE_DELIVERED ||
      process.env.DLT_TEMPLATE_VEHICLE_DELIVERED,
    BUSINESS_BOOKING_CANCELLED:
      process.env.DLT_TEMPLATE_BUSINESS_BOOKING_CANCELLED ||
      process.env.DLT_TEMPLATE_BOOKING_CANCELLED ||
      '1007907898041127491',
  };

  private canSend() {
    return !!this.msg91AuthKey;
  }

  async notifyUser(booking: Booking, event: DltEvent) {
    const phone = booking.user?.phone;
    if (!phone || !this.canSend()) {
      return;
    }
    const tpl = this.buildUserTemplate(event, booking);
    if (!tpl) return;
    await this.sendSms(phone, tpl.templateId, tpl.variables, tpl.message);
  }

  async notifyBusiness(booking: Booking, event: DltEvent) {
    const phone = booking.business?.owner?.phone;
    if (!phone || !this.canSend()) {
      return;
    }
    const tpl = this.buildBusinessTemplate(event, booking);
    if (!tpl) return;
    await this.sendSms(phone, tpl.templateId, tpl.variables, tpl.message);
  }

  private async sendSms(
    phone: string,
    templateId: string,
    variables: Record<string, string>,
    message: string,
  ) {
    try {
      const normalized = {
        // common flow variable names
        var1: variables.alphanumeric || variables.numeric || '',
        var2: variables.url || variables.alphanumeric || '',
        var3: variables.numeric || '',
      };
      const payload = {
        template_id: templateId,
        short_url: 0,
        recipients: [
          {
            mobiles: `91${phone}`,
            ...variables,
            ...normalized,
          },
        ],
      };
      await axios.post(this.msg91Url, payload, {
        headers: {
          authkey: this.msg91AuthKey!,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      this.logger.error('DLT SMS failed', err?.response?.data || err.message);
    }
  }

  private buildUserTemplate(event: DltEvent, booking: Booking) {
    switch (event) {
      case 'BOOKING_CREATED':
        return {
          templateId: this.templates.BOOKING_CREATED!,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} created.`,
        };
      case 'BOOKING_ACCEPTED':
        return {
          templateId: this.templates.BOOKING_ACCEPTED!,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} accepted.`,
        };
      case 'BOOKING_REJECTED':
        return {
          templateId: this.templates.BOOKING_REJECTED!,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} rejected.`,
        };
      case 'BOOKING_CANCELLED':
        return {
          templateId: this.templates.BOOKING_CANCELLED!,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} cancelled.`,
        };
      case 'PAYMENT_PENDING':
        return {
          templateId: this.templates.PAYMENT_PENDING!,
          variables: {
            numeric: String(booking.totalAmount ?? 0),
            alphanumeric: booking.id,
          },
          message: `Payment pending for booking ${booking.id}.`,
        };
      case 'PAYMENT_COMPLETED':
        return {
          templateId: this.templates.PAYMENT_COMPLETED!,
          variables: {
            numeric: String(booking.totalAmount ?? 0),
            alphanumeric: booking.id,
          },
          message: `Payment received for booking ${booking.id}.`,
        };
      case 'VEHICLE_DELIVERED':
        return {
          templateId: this.templates.SERVICE_COMPLETED!,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} completed.`,
        };
      default:
        return null;
    }
  }

  private buildBusinessTemplate(event: DltEvent, booking: Booking) {
    switch (event) {
      case 'BOOKING_CREATED':
        if (!this.templates.BUSINESS_BOOKING_CREATED) return null;
        return {
          templateId: this.templates.BUSINESS_BOOKING_CREATED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `New booking ${booking.id} received.`,
        };
      case 'BOOKING_ACCEPTED':
        if (!this.templates.BUSINESS_BOOKING_ACCEPTED) return null;
        return {
          templateId: this.templates.BUSINESS_BOOKING_ACCEPTED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} accepted.`,
        };
      case 'BOOKING_REJECTED':
        if (!this.templates.BUSINESS_BOOKING_REJECTED) return null;
        return {
          templateId: this.templates.BUSINESS_BOOKING_REJECTED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} rejected.`,
        };
      case 'SERVICE_STARTED':
        if (!this.templates.BUSINESS_SERVICE_STARTED) return null;
        return {
          templateId: this.templates.BUSINESS_SERVICE_STARTED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Service started for booking ${booking.id}.`,
        };
      case 'PAYMENT_PENDING':
        if (!this.templates.BUSINESS_SERVICE_COMPLETED) return null;
        return {
          templateId: this.templates.BUSINESS_SERVICE_COMPLETED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Service completed for booking ${booking.id}.`,
        };
      case 'PAYMENT_COMPLETED':
        if (!this.templates.BUSINESS_PAYMENT_COMPLETED) return null;
        return {
          templateId: this.templates.BUSINESS_PAYMENT_COMPLETED,
          variables: {
            numeric: String(booking.totalAmount ?? 0),
            alphanumeric: booking.id,
          },
          message: `Payment received for booking ${booking.id}.`,
        };
      case 'VEHICLE_DELIVERED':
        if (!this.templates.BUSINESS_VEHICLE_DELIVERED) return null;
        return {
          templateId: this.templates.BUSINESS_VEHICLE_DELIVERED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Vehicle delivered for booking ${booking.id}.`,
        };
      case 'BOOKING_CANCELLED':
        if (!this.templates.BUSINESS_BOOKING_CANCELLED) return null;
        return {
          templateId: this.templates.BUSINESS_BOOKING_CANCELLED,
          variables: { alphanumeric: booking.id, url: this.webUrl },
          message: `Booking ${booking.id} cancelled by user.`,
        };
      default:
        return null;
    }
  }
}
