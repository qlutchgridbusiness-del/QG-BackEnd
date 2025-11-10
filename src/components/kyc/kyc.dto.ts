// request-otp.dto.ts
export class RequestOtpDto {
  aadhaarNumber: string;
}

// verify-otp.dto.ts
export class VerifyOtpDto {
  aadhaarNumber: string;
  txnId: string;
  otp: string;
}
