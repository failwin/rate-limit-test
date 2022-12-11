import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('auth.module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('POST /login', () => {
    it(`should get correct result`, async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send()
        .expect(201);

      expect(res.body).toEqual({ ok: true });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
