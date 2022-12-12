export interface RateLimitStoreItem {
  total: number;
  resetTime: number;
}

export interface RateLimitStore {
  getItem(key: string): Promise<RateLimitStoreItem>;
  addItem(key: string, timeSlot: number): Promise<void>;
}

export interface RateLimitOptions {
  limit?: number;

  timeSlot?: number;

  store?: RateLimitStore;
}
