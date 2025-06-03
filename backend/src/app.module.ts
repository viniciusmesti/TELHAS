import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { EmpresaModule } from './empresas/empresa.module';
import { ProcessModule } from './process/process.module';
import { SupabaseProvider } from './supabase/supabase.client';
import { DownloadsModule } from './downloads/downloads.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    EmpresaModule,
    ProcessModule,
    DownloadsModule,
    DashboardModule,
  ],
  providers: [PrismaService, SupabaseProvider],
  exports: [PrismaService, SupabaseProvider],
})
export class AppModule {}
