import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BusinessKycService } from './business-kyc.service';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';
// business-kyc.controller.ts
@Controller('business/:id/kyc')
@UseGuards(JwtAuthGuard)
export class BusinessKycController {
  constructor(private readonly service: BusinessKycService) {}

  @Post('pan')
  submitPan(
    @Req() req,
    @Param('id') businessId: string,
    @Body('pan') pan: string,
  ) {
    return this.service.submitPan(req.user.id, businessId, pan);
  }

  @Post('gst')
  submitGst(
    @Req() req,
    @Param('id') businessId: string,
    @Body('gst') gst: string,
  ) {
    return this.service.submitGst(req.user.id, businessId, gst);
  }

  @Get('status')
  getStatus(@Req() req, @Param('id') businessId: string) {
    return this.service.getStatus(req.user.id, businessId);
  }
}
