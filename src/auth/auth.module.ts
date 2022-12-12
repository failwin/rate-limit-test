import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { LoginController } from './login.controller';

@Module({
  imports: [ConfigModule, RateLimitModule.forRoot({})],
  controllers: [LoginController],
})
export class AuthModule {}
