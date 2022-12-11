import { Controller, Post } from '@nestjs/common';

@Controller('/login')
export class LoginController {
  @Post('/')
  async login(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}
