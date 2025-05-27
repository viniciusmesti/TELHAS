import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService, PrismaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
