import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { LoginController } from './login.controller';

@Module({
  imports: [
    ConfigModule,
    RateLimitModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          limit: parseInt(config.get('RATE_LIMIT'), 10),
          timeSlot: parseInt(config.get('RATE_LIMIT_TIME_SLOT'), 10),
        };
      },
    }),
  ],
  controllers: [LoginController],
})
export class AuthModule {}
