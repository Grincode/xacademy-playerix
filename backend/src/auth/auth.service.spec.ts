import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hashed',
    role: 'user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createFromDto: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should create a user via UsersService and return an access token', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.createFromDto.mockResolvedValue(mockUser);

      const result = await authService.register(dto);

      expect(usersService.createFromDto).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({ access_token: 'test-jwt-token' });
    });

    it('should propagate ConflictException when email already exists', async () => {
      const dto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      usersService.createFromDto.mockRejectedValue(
        new ConflictException('Email already in use'),
      );

      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.createFromDto).toHaveBeenCalledWith({
        email: 'existing@example.com',
        password: 'password123',
        role: 'user',
      });
    });
  });
});
