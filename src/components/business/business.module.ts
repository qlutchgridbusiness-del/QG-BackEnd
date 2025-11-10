import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { User } from '../user/user.entity';
import { SocialPostEntity } from '../business-services/social-post.entity';
import { S3Service } from '../aws/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      BusinessServiceEntity,
      SocialPostEntity,
      User,
    ]), // 👈 register repositories
  ],
  providers: [BusinessService, BusinessServiceEntity, S3Service],
  controllers: [BusinessController],
  exports: [BusinessService],
})
export class BusinessModule {}
