import { Controller, Post, Body, Res, HttpStatus, UnauthorizedException, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    try {
      const { accessToken } = await this.authService.login(loginDto);
      return response.status(HttpStatus.OK).json({ token: accessToken });
    } catch (error) {
      return response.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
    try {
      const newUser = await this.authService.register(registerDto);
      return response.status(HttpStatus.CREATED).send(newUser);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
    }
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return await this.authService.requestPasswordReset(email);
  }
}
