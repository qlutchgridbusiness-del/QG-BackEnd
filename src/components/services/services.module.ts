import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from './services.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Business } from '../business/business.entity';
import { BusinessServiceEntity } from '../business-services/business-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Services, BusinessServiceEntity])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServiceModule {}
