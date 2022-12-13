import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

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

export interface RateLimitOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<RateLimitOptions> | RateLimitOptions;
  inject?: any[];
}
