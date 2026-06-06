import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('should call authService.register() and return access_token with 201', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.register.mockResolvedValue({
        access_token: 'test-jwt-token',
      });

      const result = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ access_token: 'test-jwt-token' });
    });

    it('should propagate ConflictException from AuthService', async () => {
      const dto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      authService.register.mockRejectedValue(
        new (require('@nestjs/common').ConflictException)(
          'Email already in use',
        ),
      );

      await expect(authController.register(dto)).rejects.toThrow(
        'Email already in use',
      );
    });
  });
});
