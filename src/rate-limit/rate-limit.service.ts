import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RateLimitStore, RateLimitStoreResponse } from './rate-limit.iterfaces';

type StartTime = number;

type ResetTime = number;

type RateLimitStoreItem = [StartTime, ResetTime];

interface RateLimitFindResponse {
  ip: string;
  count: number;
}

@Injectable()
export class RateLimitStoreService
  implements RateLimitStore, OnApplicationBootstrap
{
  private readonly logger = new Logger(RateLimitStoreService.name);

  private store: Record<string, RateLimitStoreItem[]> = {};

  private timeoutIds: NodeJS.Timeout[] = [];

  async getItem(key: string): Promise<RateLimitStoreResponse> {
    const storeItem = this.store[key] || [];

    let resetTime = 0;
    if (storeItem.length > 0) {
      const [, resetItemTime] = storeItem[0];
      resetTime = Math.ceil((resetItemTime - Date.now()) / 1000);
    }

    return { total: storeItem.length, resetTime };
  }

  async addItem(key: string, timeSlot: number): Promise<void> {
    const timeSlotMs = timeSlot * 1000;
    if (!this.store[key]) {
      this.store[key] = [];
    }

    // save
    const startTime = Date.now();
    const resetTime = startTime + timeSlotMs;
    this.store[key].push([startTime, resetTime]);

    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      // clear
      this.store[key].shift();
      // remove
      this.timeoutIds = this.timeoutIds.filter((id) => id != timeoutId);
    }, timeSlotMs);

    this.timeoutIds.push(timeoutId);
  }

  private findInTimeFrame(timeSlot: number): RateLimitFindResponse[] {
    const compareTime = Date.now() - timeSlot * 1000;

    const res = [];
    Object.keys(this.store).forEach((key) => {
      const storeItem = this.store[key] || [];
      const matched = storeItem.filter(
        ([startTime]) => startTime > compareTime,
      );
      if (matched.length) {
        res.push({ ip: key, count: matched.length });
      }
    });

    return res;
  }

  onApplicationBootstrap(): any {
    const timeSec = 60;
    setInterval(() => {
      const statistic = this.findInTimeFrame(timeSec);
      if (statistic.length) {
        this.logger.log(
          'Requests statistic: ' + JSON.stringify(statistic, null, 4),
        );
      }
    }, timeSec * 1000);
  }
}
