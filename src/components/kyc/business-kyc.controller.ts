import { Body, Controller, Param, Post } from '@nestjs/common';
import { BusinessKycService } from './business-kyc.service';
// business-kyc.controller.ts
@Controller('business/:id/kyc')
export class BusinessKycController {
  constructor(private readonly service: BusinessKycService) {}

  @Post('pan')
  submitPan(@Param('id') businessId: string, @Body('pan') pan: string) {
    return this.service.submitPan(businessId, pan);
  }

  @Post('gst')
  submitGst(@Param('id') businessId: string, @Body('gst') gst: string) {
    return this.service.submitGst(businessId, gst);
  }
}
