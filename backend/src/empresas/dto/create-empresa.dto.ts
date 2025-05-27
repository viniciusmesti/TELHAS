import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @IsNotEmpty()
  @IsString()
  codigoSistema: string;

  @IsNotEmpty()
  @IsString()
  apelido: string;

  @IsOptional()
  @IsObject()
  regras?: Record<string, any>; // Permite armazenar regras como JSON
}
