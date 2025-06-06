import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const loginDto = { email: 'test@example.com', password: 'secret' };
    const user = { id: '1', email: loginDto.email, password: 'hashed' };
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    const result = await service.login(loginDto as any);

    expect(result).toEqual({ accessToken: 'token' });
    expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
  });

  it('should throw if user is not found', async () => {
    const loginDto = { email: 'missing@example.com', password: 'secret' };
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login(loginDto as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw if password is invalid', async () => {
    const loginDto = { email: 'test@example.com', password: 'wrong' };
    const user = { id: '1', email: loginDto.email, password: 'hashed' };
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login(loginDto as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
