// backend/src/auth/admin-auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as process from 'process';

@Controller('admin')
export class AdminAuthController {
  @Post('validate')
  validateAdminCode(@Body('code') code: string) {
    // Lê a variável de ambiente que definimos acima
    const secret = process.env.ADMIN_SECRET_CODE;
    if (!secret) {
      throw new UnauthorizedException('Admin code não configurado no servidor.');
    }
    // Se bate, retorna um “ok”; se não, lança 401.
    if (code === secret) {
      return { success: true };
    } else {
      throw new UnauthorizedException('Código inválido.');
    }
  }
}
