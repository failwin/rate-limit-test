import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';

describe('LoginController', () => {
  let controller: LoginController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return correct result ', async () => {
      const result = await controller.login();
      expect(result).toEqual({ ok: true });
    });
  });
});
