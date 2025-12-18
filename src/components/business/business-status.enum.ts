export enum BusinessStatus {
  DRAFT = 'DRAFT',
  KYC_PENDING = 'KYC_PENDING',
  KYC_UNDER_REVIEW = 'KYC_UNDER_REVIEW',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
}

export enum ServiceStatus {
  DRAFT, // added during registration
  ACTIVE, // visible & bookable
  DISABLED, // business turned off
}
