import { Body, Controller, Post } from '@nestjs/common';
import { KycService } from './kyc.service';
import { RequestOtpDto, VerifyOtpDto } from './kyc.dto';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('aadhaar/request-otp')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.kycService.requestAadhaarOtp(dto.aadhaarNumber);
  }

  @Post('aadhaar/verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.kycService.verifyAadhaarOtp(dto.aadhaarNumber, dto.txnId, dto.otp);
  }

  @Post('pan/verify')
  verifyPan(@Body('panNumber') panNumber: string) {
    return this.kycService.verifyPan(panNumber);
  }
}
