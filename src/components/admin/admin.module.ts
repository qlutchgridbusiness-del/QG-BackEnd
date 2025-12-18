import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { Business } from '../business/business.entity';
import { BusinessKyc } from '../kyc/business-kyc.entity';

import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';

import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

import { AdminBusinessesController } from './businesses/admin-businesses.controller';
import { AdminBusinessesService } from './businesses/admin-businesses.service';

import { AdminKycController } from './kyc/admin-kyc.controller';
import { AdminKycService } from './kyc/admin-kyc.service';

import { AdminContractsController } from './contracts/admin-contracts.controller';
import { AdminContractsService } from './contracts/admin-contracts.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Business, BusinessKyc])],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminBusinessesController,
    AdminKycController,
    AdminContractsController,
  ],
  providers: [
    AdminDashboardService,
    AdminUsersService,
    AdminBusinessesService,
    AdminKycService,
    AdminContractsService,
  ],
})
export class AdminModule {}
