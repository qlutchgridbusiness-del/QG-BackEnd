import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
import { PushService } from './push.service';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  async subscribe(@Req() req, @Body() body: any) {
    await this.pushService.upsertSubscription(req.user.id, body);
    return { success: true };
  }

  @Post('test')
  async test(@Req() req) {
    const result = await this.pushService.notifyUser(req.user.id, {
      title: 'Test Notification',
      body: 'Push notifications are working.',
      url: 'https://qlutchgrid.com/business-dashboard',
      ts: new Date().toISOString(),
    });
    return { success: true, result };
  }

}
