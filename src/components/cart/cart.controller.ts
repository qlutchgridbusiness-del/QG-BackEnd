import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /* ---------------- ADD TO CART ---------------- */
  @Post('add')
  @ApiOperation({ summary: 'Add service to cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'uuid-user' },
        serviceId: { type: 'string', example: 'uuid-service' },
      },
      required: ['userId', 'serviceId'],
    },
  })
  addToCart(@Body() body: { userId: string; serviceId: string }) {
    return this.cartService.addToCart(body.userId, body.serviceId);
  }

  /* ---------------- REMOVE FROM CART ---------------- */
  @Post('remove')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'uuid-user' },
        cartItemId: { type: 'string', example: 'uuid-cart-item' },
      },
      required: ['userId', 'cartItemId'],
    },
  })
  removeFromCart(@Body() body: { userId: string; cartItemId: string }) {
    return this.cartService.removeFromCart(body.userId, body.cartItemId);
  }

  /* ---------------- LIST CART ---------------- */
  @Get()
  @ApiOperation({ summary: 'Get user cart items' })
  @ApiQuery({
    name: 'userId',
    type: String,
    required: true,
  })
  listCart(@Query('userId') userId: string) {
    return this.cartService.listCart(userId);
  }

  /* ---------------- CHECKOUT ---------------- */
  @Post('checkout')
  @ApiOperation({ summary: 'Checkout cart and create bookings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'uuid-user' },
        scheduledAt: {
          type: 'string',
          example: '2025-01-20T10:00:00Z',
          nullable: true,
        },
      },
      required: ['userId'],
    },
  })
  checkout(
    @Body()
    body: {
      userId: string;
      scheduledAt?: string;
    },
  ) {
    return this.cartService.checkout(body.userId, body.scheduledAt);
  }
}
