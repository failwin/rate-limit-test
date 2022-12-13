import { Module, DynamicModule, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  RateLimitOptions,
  RateLimitOptionsAsync,
} from './rate-limit.iterfaces';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitStoreService } from './rate-limit.service';
import { RATE_LIMIT_OPTIONS, RATE_LIMIT_STORE } from './rate-limit.constants';

export { RateLimitGuard } from './rate-limit.guard';
export { RateLimit } from './rate-limit.decorators';

@Module({})
export class RateLimitModule {
  static forRoot(options: RateLimitOptions): DynamicModule {
    const providers = this.getProviders(options);
    const guardProvider = { provide: APP_GUARD, useClass: RateLimitGuard };

    return {
      module: RateLimitModule,
      providers: [...providers, guardProvider],
      exports: providers,
    };
  }

  static forRootAsync(options: RateLimitOptionsAsync): DynamicModule {
    const providers = this.getProviders(options);
    const guardProvider = { provide: APP_GUARD, useClass: RateLimitGuard };

    return {
      module: RateLimitModule,
      imports: options.imports || [],
      providers: [...providers, guardProvider],
      exports: providers,
    };
  }

  private static getProviders(
    options: RateLimitOptions | RateLimitOptionsAsync,
  ): Provider[] {
    const storeProvider = {
      provide: RATE_LIMIT_STORE,
      useFactory: (options: RateLimitOptions) => {
        return options.store ? options.store : new RateLimitStoreService();
      },
      inject: [RATE_LIMIT_OPTIONS],
    };

    let optionsProvider;
    if (this.isAsyncOptions(options)) {
      optionsProvider = {
        provide: RATE_LIMIT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    } else {
      optionsProvider = {
        provide: RATE_LIMIT_OPTIONS,
        useValue: options,
      };
    }
    return [optionsProvider, storeProvider];
  }

  private static isAsyncOptions(
    obj: RateLimitOptionsAsync | any,
  ): obj is RateLimitOptionsAsync {
    return obj && typeof obj.useFactory !== 'undefined';
  }
}
