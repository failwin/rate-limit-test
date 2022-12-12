import { Controller, Post, Get } from '@nestjs/common';
import { RateLimit } from '../rate-limit/rate-limit.module';

@Controller('/login')
export class LoginController {
  @RateLimit()
  @Get('/')
  // @Post('/')
  async login(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}
