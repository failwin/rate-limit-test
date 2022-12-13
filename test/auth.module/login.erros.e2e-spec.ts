import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('auth.module', () => {
  let app: INestApplication;
  let processEnv;

  beforeAll(async () => {
    processEnv = { ...process.env };
    process.env.RATE_LIMIT = '2';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('POST /login', () => {
    it(`should return an error for for rate limit`, async () => {
      await request(app.getHttpServer()).post('/login').send().expect(201);
      await request(app.getHttpServer()).post('/login').send().expect(201);

      const res = await request(app.getHttpServer())
        .post('/login')
        .send()
        .expect(429);

      expect(res.body).toEqual({
        message: 'Too Many Requests',
        statusCode: 429,
      });
    });
  });

  afterAll(async () => {
    process.env = processEnv;
    await app.close();
  });
});
