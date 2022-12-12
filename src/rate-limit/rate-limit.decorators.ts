import {
  RATE_LIMIT_DECORATOR,
  RATE_LIMIT_DECORATOR_LIMIT,
  RATE_LIMIT_DECORATOR_TIME_SLOT,
  DEFAULT_LIMIT,
  DEFAULT_TIME_SLOT,
} from './rate-limit.constants';

function setMetadata(target: any, limit: number, timeClot: number): void {
  Reflect.defineMetadata(RATE_LIMIT_DECORATOR, true, target);
  Reflect.defineMetadata(RATE_LIMIT_DECORATOR_LIMIT, limit, target);
  Reflect.defineMetadata(RATE_LIMIT_DECORATOR_TIME_SLOT, timeClot, target);
}

export const RateLimit = (
  limit = DEFAULT_LIMIT,
  timeClot = DEFAULT_TIME_SLOT,
): MethodDecorator & ClassDecorator => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (descriptor) {
      setMetadata(descriptor.value, limit, timeClot);
      return descriptor;
    }
    setMetadata(target, limit, timeClot);
    return target;
  };
};
