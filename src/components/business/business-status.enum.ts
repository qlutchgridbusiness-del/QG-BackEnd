export enum BusinessStatus {
  DRAFT = 'DRAFT', // created, incomplete
  PROFILE_COMPLETED = 'PROFILE_COMPLETED', // details + services added
  KYC_PENDING = 'KYC_PENDING', // docs uploaded
  KYC_UNDER_REVIEW = 'KYC_UNDER_REVIEW',
  KYC_REJECTED = 'KYC_REJECTED',
  CONTRACT_PENDING = 'CONTRACT_PENDING',
  ACTIVE = 'ACTIVE', // visible & bookable
  SUSPENDED = 'SUSPENDED', // admin action
  DEACTIVATED = 'DEACTIVATED', // business closed
}

export enum ServiceStatus {
  DRAFT = 'DRAFT', // added during onboarding
  ACTIVE = 'ACTIVE', // bookable
  DISABLED = 'DISABLED', // business turned off
  BLOCKED = 'BLOCKED', // admin blocked
}
