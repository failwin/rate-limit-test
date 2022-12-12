import { Module, DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitOptions } from './rate-limit.iterfaces';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitStoreService } from './rate-limit.service';
import { RATE_LIMIT_OPTIONS, RATE_LIMIT_STORE } from './rate-limit.constants';

export { RateLimitGuard } from './rate-limit.guard';
export { RateLimit } from './rate-limit.decorators';

@Module({})
export class RateLimitModule {
  static forRoot(options: RateLimitOptions): DynamicModule {
    const optionsProvider = {
      provide: RATE_LIMIT_OPTIONS,
      useValue: options,
    };

    const storeProvider = {
      provide: RATE_LIMIT_STORE,
      useFactory: (options: RateLimitOptions) => {
        return options.store ? options.store : new RateLimitStoreService();
      },
      inject: [RATE_LIMIT_OPTIONS],
    };

    const guardProvider = { provide: APP_GUARD, useClass: RateLimitGuard };

    return {
      module: RateLimitModule,
      providers: [optionsProvider, storeProvider, guardProvider],
      exports: [optionsProvider],
    };
  }
}
