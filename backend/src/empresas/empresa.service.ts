import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async createEmpresa(createEmpresaDto: CreateEmpresaDto) {
    return this.prisma.empresa.create({
      data: createEmpresaDto,
    });
  }

  async findAll() {
    return this.prisma.empresa.findMany();
  }

  async findByCnpj(cnpj: string) {
    return this.prisma.empresa.findUnique({
      where: { cnpj },
    });
  }

  async findById(id: string) {
    return this.prisma.empresa.findUnique({
      where: { id },
    });
  }

  async updateEmpresa(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  async deleteEmpresa(id: string) {
    return this.prisma.empresa.delete({
      where: { id },
    });
  }

  async updateEmpresaRules(id: string, regras: any) {
    return this.prisma.empresa.update({
      where: { id },
      data: { regras },
    });
  }

  async getEmpresaRules(id: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });
    return empresa?.regras || {};
  }
}
