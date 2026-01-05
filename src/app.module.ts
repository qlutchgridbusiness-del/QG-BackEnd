import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './components/auth/auth.module';
import { BookingsModule } from './components/bookings/bookings.module';
import { BusinessModule } from './components/business/business.module';
import { PaymentsModule } from './components/payments/payments.module';
import { KycModule } from './components/kyc/kyc.module';
import { ServiceModule } from './components/services/services.module';
import { AdminModule } from './components/admin/admin.module';
import { UserModule } from './components/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 👇 Register TypeORM with your DB config
    TypeOrmModule.forRoot({
      type: 'postgres', // or 'mysql', etc.
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'abhisheksh',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'qlutch_grid',
      autoLoadEntities: true,
      synchronize: false, // ❗ auto-create tables in dev, disable in prod
      logging: true,
      migrationsRun: false,
    }),
    AdminModule,
    AuthModule,
    BookingsModule,
    BusinessModule,
    PaymentsModule,
    KycModule,
    ServiceModule,
    UserModule,
  ],
})
export class AppModule {}
