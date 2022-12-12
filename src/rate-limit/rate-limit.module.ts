import { Module, DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitOptions } from './rate-limit.options';
import { RateLimitGuard } from './rate-limit.guard';
import { RATE_LIMIT_OPTIONS } from './rate-limit.constants';

export { RateLimitGuard } from './rate-limit.guard';
export { RateLimit } from './rate-limit.decorators';

@Module({})
export class RateLimitModule {
  static forRoot(options: RateLimitOptions): DynamicModule {
    const optionsProvider = {
      provide: RATE_LIMIT_OPTIONS,
      useValue: options,
    };

    const guardProvider = { provide: APP_GUARD, useClass: RateLimitGuard };

    return {
      module: RateLimitModule,
      providers: [optionsProvider, guardProvider],
      exports: [optionsProvider],
    };
  }
}
