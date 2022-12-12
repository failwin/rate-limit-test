import { Injectable } from '@nestjs/common';
import { RateLimitStore, RateLimitStoreItem } from './rate-limit.iterfaces';

@Injectable()
export class RateLimitStoreService implements RateLimitStore {
  private store: Record<string, number[]> = {};

  private timeoutIds: NodeJS.Timeout[] = [];

  async getItem(key: string): Promise<RateLimitStoreItem> {
    const storeItem = this.store[key] || [];

    const resetTime =
      storeItem.length > 0 ? Math.ceil((storeItem[0] - Date.now()) / 1000) : 0;

    return { total: storeItem.length, resetTime };
  }

  async addItem(key: string, timeSlot: number): Promise<void> {
    const timeSlotMs = timeSlot * 1000;
    if (!this.store[key]) {
      this.store[key] = [];
    }

    // save
    this.store[key].push(Date.now() + timeSlotMs);

    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      // clear
      this.store[key].shift();
      // remove
      this.timeoutIds = this.timeoutIds.filter((id) => id != timeoutId);
    }, timeSlotMs);

    this.timeoutIds.push(timeoutId);
  }
}
