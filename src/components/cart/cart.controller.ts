import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cs: CartService) {}

  @Post('add')
  add(
    @Body()
    body: {
      userId: string;
      serviceId: string;
      businessId: string;
      qty?: number;
      price?: number;
    },
  ) {
    return this.cs.add(body);
  }

  @Post('remove')
  remove(@Body() body: { userId: string; serviceId: string }) {
    return this.cs.remove(body);
  }

  @Get()
  list(@Query('userId') userId: string) {
    return this.cs.list(userId);
  }

  @Post('checkout')
  async checkout(
    @Body() body: { userId: string; items: any[]; scheduledAt?: string },
  ) {
    return this.cs.checkout(body);
  }
}
