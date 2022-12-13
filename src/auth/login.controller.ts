import { Controller, Post } from '@nestjs/common';
import { RateLimit } from '../rate-limit/rate-limit.module';

@Controller('/login')
export class LoginController {
  @RateLimit()
  @Post('/')
  async login(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}
