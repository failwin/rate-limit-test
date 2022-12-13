import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Type, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import {
  RateLimitOptions,
  RateLimitStore,
  RateLimitStoreResponse,
} from './rate-limit.iterfaces';
import {
  RATE_LIMIT_OPTIONS,
  RATE_LIMIT_STORE,
  RATE_LIMIT_DECORATOR,
  RATE_LIMIT_DECORATOR_LIMIT,
  RATE_LIMIT_DECORATOR_TIME_SLOT,
} from './rate-limit.constants';

class TestRateLimitStore implements RateLimitStore {
  private total = 0;

  addItem(key: string, timeSlot: number): Promise<void> {
    this.total++;
    return Promise.resolve();
  }

  getItem(key: string): Promise<RateLimitStoreResponse> {
    return Promise.resolve({ total: this.total, resetTime: 111 });
  }
}

const getTestRequest = () => {
  return {
    ip: '',
    ips: [],
  };
};

const getTestResponse = () => {
  return {
    headers: {},
    header(name, val) {
      this.headers[name] = val;
    },
    reset() {
      this.headers = {};
    },
  };
};

const getTestContext = (
  req,
  res,
  handler = () => ({}),
  classRef = class A {},
): ExecutionContext => {
  const context = {
    getHandler() {
      return handler;
    },
    getClass<T = any>(): Type<T> {
      return classRef as any;
    },
    switchToHttp() {
      return {
        getRequest() {
          return req;
        },
        getResponse() {
          return res;
        },
      };
    },
  };
  return context as unknown as ExecutionContext;
};

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let options;
  let reflectorData;

  beforeEach(async () => {
    reflectorData = {
      decorator: undefined,
      limit: 0,
      timeSlot: 0,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitGuard,
        {
          provide: RATE_LIMIT_OPTIONS,
          useValue: {},
        },
        {
          provide: RATE_LIMIT_STORE,
          useClass: TestRateLimitStore,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: (key) => {
              if (key === RATE_LIMIT_DECORATOR) {
                return reflectorData.decorator;
              }
              if (key === RATE_LIMIT_DECORATOR_LIMIT) {
                return reflectorData.limit;
              }
              if (key === RATE_LIMIT_DECORATOR_TIME_SLOT) {
                return reflectorData.timeSlot;
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    guard = module.get<RateLimitGuard>(RateLimitGuard);
    options = module.get<RateLimitOptions>(RATE_LIMIT_OPTIONS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('without decorator', () => {
    let res;
    let context;

    beforeEach(() => {
      const req = getTestRequest();
      res = getTestResponse();
      context = getTestContext(req, res);
    });

    it('should not update headers', async () => {
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
      expect(res.headers).toEqual({});
    });
  });

  describe('with decorator', () => {
    let res;
    let context;

    beforeEach(() => {
      const req = getTestRequest();
      res = getTestResponse();
      context = getTestContext(req, res);
      reflectorData.decorator = true;
    });

    it('should update headers with default values', async () => {
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
      expect(res.headers).toEqual({
        'X-RateLimit-Limit': 5,
        'X-RateLimit-Remaining': 4,
        'X-RateLimit-Reset': 111,
      });
    });

    it('should update headers with root values', async () => {
      options.limit = 10;
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
      expect(res.headers).toEqual({
        'X-RateLimit-Limit': 10,
        'X-RateLimit-Remaining': 9,
        'X-RateLimit-Reset': 111,
      });
    });

    it('should update headers with decorator values', async () => {
      options.limit = 10;
      reflectorData.limit = 2;
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
      expect(res.headers).toEqual({
        'X-RateLimit-Limit': 2,
        'X-RateLimit-Remaining': 1,
        'X-RateLimit-Reset': 111,
      });
    });

    describe('if limit reached', () => {
      beforeEach(async () => {
        reflectorData.limit = 1;
        await guard.canActivate(context);
        res.reset();
      });

      it('should throw "HttpException" error', async () => {
        const expectation = await expect(async () => {
          return await guard.canActivate(context);
        }).rejects;
        expectation.toThrow(HttpException);
        expectation.toThrow('Too Many Requests');
      });

      it('should update headers', async () => {
        await expect(async () => {
          await guard.canActivate(context);
        }).rejects.toThrow(HttpException);
        expect(res.headers).toEqual({
          'Retry-After': 111,
        });
      });
    });
  });
});
