export class GetBusinessServicesQuery {
  email: string;
}

export class SaveServicesDto {
  email: string;
  services: { name: string; price: number; available: boolean }[];
}

// create-business.dto.ts
export class CreateBusinessDto {
  name: string;
  panNumber?: string;
  aadhaarNumber?: string;
}

// verify-business.dto.ts
export class VerifyBusinessDto {
  panNumber?: string;
  aadhaarNumber?: string;
  otp?: string; // optional, if using Aadhaar OTP
}

