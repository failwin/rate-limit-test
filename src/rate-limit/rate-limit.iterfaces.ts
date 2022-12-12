export interface RateLimitStoreResponse {
  total: number;
  resetTime: number;
}

export interface RateLimitStore {
  getItem(key: string): Promise<RateLimitStoreResponse>;
  addItem(key: string, timeSlot: number): Promise<void>;
}

export interface RateLimitOptions {
  limit?: number;

  timeSlot?: number;

  store?: RateLimitStore;
}
