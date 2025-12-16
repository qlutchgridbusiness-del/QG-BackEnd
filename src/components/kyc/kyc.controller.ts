// src/components/kyc/kyc.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { VerifyPanDto, VerifyGstDto } from './kyc.dto';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  /* ================= PAN ================= */
  @Post('pan/verify')
  @ApiOperation({ summary: 'Verify PAN using Surepass' })
  @ApiResponse({ status: 200, description: 'PAN verified' })
  verifyPan(
    @Query('businessId') businessId: string,
    @Body() dto: VerifyPanDto,
  ) {
    return this.kycService.verifyPan(businessId, dto.panNumber);
  }

  /* ================= GST ================= */
  @Post('gst/verify')
  @ApiOperation({ summary: 'Verify GST using Surepass' })
  verifyGst(
    @Query('businessId') businessId: string,
    @Body() dto: VerifyGstDto,
  ) {
    return this.kycService.verifyGst(businessId, dto.gstNumber);
  }

  /* ================= AADHAAR ================= */
  @Get('aadhaar/digilocker')
  @ApiOperation({ summary: 'Get DigiLocker consent URL' })
  getDigilockerUrl(@Query('businessId') businessId: string) {
    return this.kycService.generateDigilockerUrl(businessId);
  }

  @Post('aadhaar/digilocker/callback')
  @ApiOperation({ summary: 'DigiLocker callback handler' })
  digilockerCallback(@Body() payload: any) {
    return this.kycService.digilockerCallback(payload);
  }
}
