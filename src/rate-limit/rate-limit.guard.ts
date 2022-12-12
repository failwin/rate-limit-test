import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitOptions, RateLimitStore } from './rate-limit.iterfaces';
import {
  RATE_LIMIT_OPTIONS,
  RATE_LIMIT_STORE,
  RATE_LIMIT_DECORATOR,
  RATE_LIMIT_DECORATOR_LIMIT,
  RATE_LIMIT_DECORATOR_TIME_SLOT,
  DEFAULT_LIMIT,
  DEFAULT_TIME_SLOT,
} from './rate-limit.constants';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject(RATE_LIMIT_OPTIONS) protected options: RateLimitOptions,
    @Inject(RATE_LIMIT_STORE) protected store: RateLimitStore,
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

    const limit = routeOrClassLimit || this.options.limit || DEFAULT_LIMIT;
    const timeSlot =
      routeOrClassTimeSlot || this.options.timeSlot || DEFAULT_TIME_SLOT;
    return this.handleRequest(context, limit, timeSlot);
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    timeSlot: number,
  ): Promise<boolean> {
    const res = context.switchToHttp().getResponse();

    const key = this.extractKey(context);
    const { total, resetTime } = await this.store.getItem(key);

    if (total >= limit) {
      res.header('Retry-After', resetTime);
      this.throwException(context);
    }

    res.header(`X-RateLimit-Limit`, limit);
    res.header(`X-RateLimit-Remaining`, Math.max(0, limit - (total + 1)));
    res.header(`X-RateLimit-Reset`, resetTime);

    await this.store.addItem(key, timeSlot);
    return true;
  }

  protected extractKey(context) {
    const req = context.switchToHttp().getRequest();
    const contextName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const ip = req.ips.length ? req.ips[0] : req.ip;
    return `${contextName}-${handlerName}-${ip}`;
  }

  protected throwException(context) {
    throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
  }
}
