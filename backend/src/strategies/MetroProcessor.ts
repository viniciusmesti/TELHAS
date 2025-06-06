import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { Injectable } from "@nestjs/common";
import { IEmpresaProcessor } from "./IEmpresaProcessor";
import { SupabaseService } from "src/supabase/supabase.service";
import { processarSalarioExcel, exportTxtGenerico } from "src/Regras/METRO/processarArquivo";
import { ProcessedInfo, uploadIfNotEmpty } from '../utils/upload';

@Injectable()
export class MetroProcessor implements IEmpresaProcessor {
  constructor(private readonly supabaseService: SupabaseService) {}


  // Method for processing METRO with two files (called from uploadMetro)
  async processUnificadoMetro(
    pagamentosPath: string,
    exportacaoPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<Record<string, ProcessedInfo>> {
    const result: Record<string, ProcessedInfo> = {};
    try {
      const { contabeis, fiscais } = processarSalarioExcel(pagamentosPath, exportacaoPath);
  
      const outputContabil = path.join(outputDir, 'saida_contabil_metro.txt');
      const outputFiscal = path.join(outputDir, 'saida_fiscal_metro.txt');
  
      exportTxtGenerico(contabeis, outputContabil, 'metro_contabil');
      exportTxtGenerico(fiscais, outputFiscal, 'metro_fiscal');
  
      await uploadIfNotEmpty(this.supabaseService, 'regra_metro_contabil', outputContabil, codigoSistema, result);
      await uploadIfNotEmpty(this.supabaseService, 'regra_metro_fiscal', outputFiscal, codigoSistema, result);
    } catch (error) {
      console.error('❌ Erro no processamento da regra METRO:', error);
      throw error;
    }
  
    return result;
  }

  // Standard interface method - looks for exportacao file in the same directory
  async processUnificado(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabaseService: SupabaseService,
  ): Promise<Record<string, ProcessedInfo>> {
    // For METRO, we need to find the exportacao file
    const inputDir = path.dirname(inputExcelPath);
    const files = fs.readdirSync(inputDir);
    
    const exportacaoFile = files.find(file => 
      file.toLowerCase().includes('exportacao') && 
      (file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls'))
    );

    if (!exportacaoFile) {
      throw new Error('Arquivo Exportacao.xlsx não encontrado no diretório de upload');
    }

    const exportacaoPath = path.join(inputDir, exportacaoFile);
    
    return this.processUnificadoMetro(inputExcelPath, exportacaoPath, outputDir, codigoSistema);
  }

  async processPagamentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabaseService: SupabaseService,
  ): Promise<{ [key: string]: string }> {
    return { message: 'METRO = regra única processada via processUnificado' };
  }

  async processRecebimentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<{ [key: string]: string }> {
    return { message: 'METRO = não possui regra separada de recebimentos' };
  }
}