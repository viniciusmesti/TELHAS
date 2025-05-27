import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  codigoSistema?: string;

  @IsOptional()
  @IsString()
  apelido?: string;

  @IsOptional()
  @IsObject()
  regras?: Record<string, any>; // Permite atualizar regras como JSON
}
