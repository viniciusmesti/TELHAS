import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('empresas')
export class EmpresaController {
  prisma: any;
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  async create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.createEmpresa(createEmpresaDto);
  }

  @Get()
  async findAll() {
    return this.empresaService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const empresa = await this.empresaService.findById(id);
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }
    return empresa;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresaService.updateEmpresa(id.trim(), updateEmpresaDto);
  }

  @Delete('codigo/:codigoSistema')
  async deleteByCodigo(@Param('codigoSistema') codigoSistema: string) {
    return this.prisma.empresa.delete({
      where: { codigoSistema },
    });
  }
  

  @Post(':id/rules')
  async updateRules(@Param('id') id: string, @Body() rules: Record<string, any>) {
    return this.empresaService.updateEmpresaRules(id, rules);
  }
}
