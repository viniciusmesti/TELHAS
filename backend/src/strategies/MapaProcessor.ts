import { Injectable } from '@nestjs/common';
import { IEmpresaProcessor } from './IEmpresaProcessor';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

import { processarArquivo255 } from '../Regras/MAPA/255/processarArquivo255';
import { processarArquivos257_1 } from '../Regras/MAPA/257-1/processarArquivo257_1';
import { processarArquivo257_2 } from 'src/Regras/MAPA/257-2/processarArquivos257_2';
import { processarArquivo282 } from 'src/Regras/MAPA/282/ProcessarArquivo282';
import { processarArquivo283 } from 'src/Regras/MAPA/283/ProcessarArquivo283';
import { processarArquivo284 } from 'src/Regras/MAPA/284-1/ProcessarArquivo284_1';
import { processarArquivo328 } from 'src/Regras/MAPA/328/ProcessarArquivo328';
import { processarArquivo329 } from 'src/Regras/MAPA/329/ProcessarArquivo329';
import { processarArquivo335 } from 'src/Regras/MAPA/335/ProcessarArquivo335';
import { processarArquivo336 } from 'src/Regras/MAPA/336/ProcessarArquivo336';
import { processarArquivo337 } from 'src/Regras/MAPA/337/ProcessarArquivo337';
import { processarArquivo347 } from 'src/Regras/MAPA/347/ProcessarArquivo347';
import { processarArquivo349 } from 'src/Regras/MAPA/349/ProcessarArquivo349';
import { processarArquivo350 } from 'src/Regras/MAPA/350/ProcessarArquivo350';
import { exportTxtGenerico, processarArquivo289Mapa } from 'src/Regras/MAPA/289/ProcessarArquivo289';
import { Processador326 } from 'src/Regras/MAPA/326/ProcessarArquivo326Mapa';


@Injectable()
export class MapaProcessor implements IEmpresaProcessor {
  constructor(private readonly supabaseService: SupabaseService) {}

  async processUnificado(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string
  ): Promise<{ [key: string]: string }> {
    const result: { [key: string]: string } = {};

    // Regra 255
    try {
      const output255 = path.join(outputDir, 'saida255.txt');
      await processarArquivo255(inputExcelPath, output255);
      const fileBuffer = fs.readFileSync(output255);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output255,
        fileBuffer,
        codigoSistema
      );
      result['regra255'] = error ? `Erro ao enviar para Supabase: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra255'] = `Erro: ${err.message}`;
    }

    // Regra 257-1
    try {
      const output257_1 = path.join(outputDir, 'saida257-1.txt');
      await processarArquivos257_1(inputExcelPath, output257_1);
      const fileBuffer = fs.readFileSync(output257_1);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output257_1,
        fileBuffer,
        codigoSistema
      );
      result['regra257_1'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra257_1'] = `Erro: ${err.message}`;
    }

    // Regra 257-2
    try {
      const output257_2 = path.join(outputDir, 'saida257-2.txt');
      await processarArquivo257_2(inputExcelPath, output257_2);
      const fileBuffer = fs.readFileSync(output257_2);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output257_2,
        fileBuffer,
        codigoSistema
      );
      result['regra257_2'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra257_2'] = `Erro: ${err.message}`;
    }

    // Regra 282
    try {
      const output282 = path.join(outputDir, 'saida282.txt');
      await processarArquivo282(inputExcelPath, output282);
      const fileBuffer = fs.readFileSync(output282);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output282,
        fileBuffer,
        codigoSistema
      );
      result['regra282'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra282'] = `Erro: ${err.message}`;
    }

    // Regra 283
    try {
      const output283 = path.join(outputDir, 'saida283.txt');
      await processarArquivo283(inputExcelPath, output283);
      const fileBuffer = fs.readFileSync(output283);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output283,
        fileBuffer,
        codigoSistema
      );
      result['regra283'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra283'] = `Erro: ${err.message}`;
    }

    // Regra 284-1
    try {
      const output284 = path.join(outputDir, 'saida284.txt');
      await processarArquivo284(inputExcelPath, output284);
      const fileBuffer = fs.readFileSync(output284);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output284,
        fileBuffer,
        codigoSistema
      );
      result['regra284'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra284'] = `Erro: ${err.message}`;
    }

    // Regra 328
    try {
      const output328 = path.join(outputDir, 'saida328.txt');
      await processarArquivo328(inputExcelPath, output328);
      const fileBuffer = fs.readFileSync(output328);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output328,
        fileBuffer,
        codigoSistema
      );
      result['regra328'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra328'] = `Erro: ${err.message}`;
    }

    // Regra 329
    try {
      const output329 = path.join(outputDir, 'saida329.txt');
      await processarArquivo329(inputExcelPath, output329);
      const fileBuffer = fs.readFileSync(output329);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output329,
        fileBuffer,
        codigoSistema
      );
      result['regra329'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra329'] = `Erro: ${err.message}`;
    }

    // Regra 335
    try {
      const output335 = path.join(outputDir, 'saida335.txt');
      await processarArquivo335(inputExcelPath, output335);
      const fileBuffer = fs.readFileSync(output335);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output335,
        fileBuffer,
        codigoSistema
      );
      result['regra335'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra335'] = `Erro: ${err.message}`;
    }

    // Regra 336
    try {
      const output336 = path.join(outputDir, 'saida336.txt');
      await processarArquivo336(inputExcelPath, output336);
      const fileBuffer = fs.readFileSync(output336);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output336,
        fileBuffer,
        codigoSistema
      );
      result['regra336'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra336'] = `Erro: ${err.message}`;
    }

    // Regra 337
    try {
      const output337 = path.join(outputDir, 'saida337.txt');
      await processarArquivo337(inputExcelPath, output337);
      const fileBuffer = fs.readFileSync(output337);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output337,
        fileBuffer,
        codigoSistema
      );
      result['regra337'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra337'] = `Erro: ${err.message}`;
    }

    // Regra 347
    try {
      const output347 = path.join(outputDir, 'saida347.txt');
      await processarArquivo347(inputExcelPath, output347);
      const fileBuffer = fs.readFileSync(output347);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output347,
        fileBuffer,
        codigoSistema
      );
      result['regra347'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra347'] = `Erro: ${err.message}`;
    }

    // Regra 349
    try {
      const output349 = path.join(outputDir, 'saida349.txt');
      await processarArquivo349(inputExcelPath, output349);
      const fileBuffer = fs.readFileSync(output349);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output349,
        fileBuffer,
        codigoSistema
      );
      result['regra349'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra349'] = `Erro: ${err.message}`;
    }

    // Regra 350
    try {
      const output350 = path.join(outputDir, 'saida350.txt');
      await processarArquivo350(inputExcelPath, output350);
      const fileBuffer = fs.readFileSync(output350);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        output350,
        fileBuffer,
        codigoSistema
      );
      result['regra350'] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
    } catch (err: any) {
      result['regra350'] = `Erro: ${err.message}`;
    }

    // Se não for mais necessário normalizar o caminho local, pode remover essa parte.
    // console.log("DEBUG: Result final após upload:", result);
    return result;
  }

  async processRegra289(
    pagamentosPath: string,
    duplicatasPath: string,
    outputDir: string,
    codigoSistema: string
  ): Promise<{ [key: string]: string }> {
    const result: { [key: string]: string } = {};
    try {
      // Executa o processamento específico da regra 289
      const { contabil, fiscal, duplicatas } = await processarArquivo289Mapa(pagamentosPath, duplicatasPath);
      
      // Define os caminhos para os arquivos de saída
      const outputContabilPath = path.join(outputDir, 'contabil289_mapa.txt');
      const outputFiscalPath = path.join(outputDir, 'fiscal289_mapa.txt');
      const outputDuplicatasPath = path.join(outputDir, 'duplicatas_nao_encontradas289_mapa.xlsx');

      // Exporta os arquivos TXT
      exportTxtGenerico(contabil, outputContabilPath, '289_contabil');
      exportTxtGenerico(fiscal, outputFiscalPath, '289_fiscal');

      // Exporta duplicatas para Excel ou gera um arquivo padrão se não houver registros
      if (duplicatas.length > 0) {
        const workbookOut = xlsx.utils.book_new();
        const worksheetOut = xlsx.utils.json_to_sheet(duplicatas);
        xlsx.utils.book_append_sheet(workbookOut, worksheetOut, 'Duplicatas');
        xlsx.writeFile(workbookOut, outputDuplicatasPath);
      } else {
        fs.writeFileSync(
          outputDuplicatasPath,
          'Arquivo gerado automaticamente, mas não há duplicatas não encontradas.\r\n',
          { encoding: 'utf8' }
        );
      }

      const fileBufferContabil = fs.readFileSync(outputContabilPath);
      let uploadResult = await this.supabaseService.uploadProcessedFile(outputContabilPath, fileBufferContabil, codigoSistema);
      result['regra289_contabil'] = uploadResult.error ? `Erro ao enviar: ${uploadResult.error.message}` : uploadResult.supabasePath;

      const fileBufferFiscal = fs.readFileSync(outputFiscalPath);
      uploadResult = await this.supabaseService.uploadProcessedFile(outputFiscalPath, fileBufferFiscal, codigoSistema);
      result['regra289_fiscal'] = uploadResult.error ? `Erro ao enviar: ${uploadResult.error.message}` : uploadResult.supabasePath; 

      const fileBufferDuplicatas = fs.readFileSync(outputDuplicatasPath);
      uploadResult = await this.supabaseService.uploadProcessedFile(outputDuplicatasPath, fileBufferDuplicatas, codigoSistema);
      result['regra289_duplicatas'] = uploadResult.error ? `Erro ao enviar: ${uploadResult.error.message}` : uploadResult.supabasePath;

      return result;
    } catch (error) {
      console.error('Erro no processamento da regra 289:', error); 
      throw error;
    }
  }

  async processRegra326(
    pagamentosPath: string,
    duplicatasPath: string,
    outputDir: string,
    codigoSistema: string
  ): Promise<{ [key: string]: string }> {
    const result: { [key: string]: string } = {};
    const outputContabilPath = path.join(outputDir, 'contabil326_mapa.txt');
    const outputFiscalPath = path.join(outputDir, 'fiscal326_mapa.txt');
    const outputDuplicatasPath = path.join(outputDir, 'duplicatas_nao_encontradas326_mapa.xlsx');

    try {
      await Processador326.processarArquivo326(
        pagamentosPath,
        duplicatasPath,
        outputContabilPath,
        outputFiscalPath,
        outputDuplicatasPath
      );

      // Upload dos arquivos processados
      const filesToUpload = [
        { path: outputContabilPath, key: 'regra326_contabil' },
        { path: outputFiscalPath, key: 'regra326_fiscal' },
        { path: outputDuplicatasPath, key: 'regra326_duplicatas' }
      ];

      for (const file of filesToUpload) {
        if (fs.existsSync(file.path)) {
          const fileBuffer = fs.readFileSync(file.path);
          const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
            file.path,
            fileBuffer,
            codigoSistema
          );
          result[file.key] = error ? `Erro ao enviar: ${error.message}` : supabasePath;
        } else {
          result[file.key] = `Arquivo não encontrado: ${file.path}`;
        }
      }
    } catch (err: any) {
      result['error'] = `Erro no processamento: ${err.message}`;
    }

    return result;
  }
  

  async processPagamentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabaseService: SupabaseService
  ): Promise<{ [key: string]: string }> {
    return { message: 'MAPA - pagamentos ainda não implementado...' };
  }

  async processRecebimentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string
  ): Promise<{ [key: string]: string }> {
    return { message: 'MAPA - recebimentos ainda não implementado...' };
  }
}
