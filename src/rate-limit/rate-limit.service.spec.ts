import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitStoreService } from './rate-limit.service';

describe('RateLimitStoreService', () => {
  let storeService: RateLimitStoreService;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitStoreService],
    }).compile();

    storeService = module.get<RateLimitStoreService>(RateLimitStoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(storeService).toBeDefined();
  });

  it('should store items', async () => {
    await storeService.addItem('1', 5);
    await storeService.addItem('2', 5);
    await storeService.addItem('1', 5);
    const res = await storeService.getItem('1');
    expect(res).toEqual({ total: 2, resetTime: 5 });
  });

  it('should return reset time correctly', async () => {
    await storeService.addItem('1', 5);
    await storeService.addItem('2', 5);
    await storeService.addItem('1', 5);

    jest.advanceTimersByTime(2000);

    const res = await storeService.getItem('1');
    expect(res).toEqual({ total: 2, resetTime: 3 });
  });

  it('should update items base on time slots', async () => {
    await storeService.addItem('1', 5);
    await storeService.addItem('2', 5);
    await storeService.addItem('1', 10);

    jest.advanceTimersByTime(7000);

    const res = await storeService.getItem('1');
    expect(res).toEqual({ total: 1, resetTime: 3 });
  });
});
