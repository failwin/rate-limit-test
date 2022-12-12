import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitOptions } from './rate-limit.options';
import {
  RATE_LIMIT_OPTIONS,
  RATE_LIMIT_DECORATOR,
  RATE_LIMIT_DECORATOR_LIMIT,
  RATE_LIMIT_DECORATOR_TIME_SLOT,
} from './rate-limit.constants';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject(RATE_LIMIT_OPTIONS) protected options: RateLimitOptions,
    protected readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const classRef = context.getClass();

    const routeOrClassDecorator = this.reflector.getAllAndOverride<number>(
      RATE_LIMIT_DECORATOR,
      [handler, classRef],
    );

    if (!routeOrClassDecorator) {
      return true;
    }

    const routeOrClassLimit = this.reflector.getAllAndOverride<number>(
      RATE_LIMIT_DECORATOR_LIMIT,
      [handler, classRef],
    );
    const routeOrClassTimeSlot = this.reflector.getAllAndOverride<number>(
      RATE_LIMIT_DECORATOR_TIME_SLOT,
      [handler, classRef],
    );

    const limit = routeOrClassLimit || this.options.limit;
    const timeSlot = routeOrClassTimeSlot || this.options.timeSlot;
    return this.handleRequest(context, limit, timeSlot);
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    timeSlot: number,
  ): Promise<boolean> {
    console.log('canActivate');
    return true;
  }
}
