import { Injectable } from '@nestjs/common';
import { IEmpresaProcessor } from './IEmpresaProcessor';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

import { processarArquivo255 as processarArquivo255Telhaco } from 'src/Regras/TELHAÇO/255/ProcessarArquivo255';
import { processarArquivos257_1 as processarArquivos257_1Telhaco } from 'src/Regras/TELHAÇO/257-1/ProcessarArquivo257_1';
import { processarArquivo257_2 as processarArquivos257_2Telhaco } from 'src/Regras/TELHAÇO/257-2/ProcessarArquivo257_2';
import { processarArquivo282 as processarArquivo282Telhaco } from 'src/Regras/TELHAÇO/282/ProcessarArquivo282';
import { processarArquivo283 as processarArquivo283Telhaco } from 'src/Regras/TELHAÇO/283/ProcessarArquivo283';
import { processarArquivo284 as processarArquivo284_1Telhaco } from 'src/Regras/TELHAÇO/284-1/ProcessarArquivo284_1';
import { processarArquivo328 as processarArquivo328Telhaco } from 'src/Regras/TELHAÇO/328/ProcessarArquivo328';
import { processarArquivo329 as processarArquivo329Telhaco } from 'src/Regras/TELHAÇO/329/ProcessarArquivo329';
import { processarArquivo335 as processarArquivo335Telhaco } from 'src/Regras/TELHAÇO/335/ProcessarArquivo335';
import { processarArquivo336 as processarArquivo336Telhaco } from 'src/Regras/TELHAÇO/336/ProcessarArquivo336';
import { processarArquivo337 as processarArquivo337Telhaco } from 'src/Regras/TELHAÇO/337/ProcessarArquivo337';
import { processarArquivo347 as processarArquivo347Telhaco } from 'src/Regras/TELHAÇO/347/ProcessarArquivo347';
import { processarArquivo349 as processarArquivo349Telhaco } from 'src/Regras/TELHAÇO/349/ProcessarArquivo349';
import { processarArquivo350 as processarArquivo350Telhaco } from 'src/Regras/TELHAÇO/350/ProcessarArquivo350';
import {
  exportToTxt289,
  processarArquivo289Telhacao,
} from 'src/Regras/TELHAÇO/289/ProcessarArquivo289';
import { Processador326 } from 'src/Regras/TELHAÇO/326/ProcessarArquivo326';

interface ProcessedInfo {
  path: string;
  size: number;
}

@Injectable()
export class TelhacoProcessor implements IEmpresaProcessor {
  constructor(private supabaseService: SupabaseService) {}

  private async uploadIfNotEmpty(
    key: string,
    filePath: string,
    codigoSistema: string,
    result: Record<string, ProcessedInfo>,
  ) {
    const stats = fs.statSync(filePath);
    if (stats.size > 0) {
      const fileBuffer = fs.readFileSync(filePath);
      const { supabasePath, error } = await this.supabaseService.uploadProcessedFile(
        filePath,
        fileBuffer,
        codigoSistema,
      );
      result[key] = {
        path: supabasePath,
        size: stats.size,
      };
    } else {
      fs.unlinkSync(filePath); // remove vazios
    }
  }

  async processUnificado(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<Record<string, ProcessedInfo>> {
    const result: Record<string, ProcessedInfo> = {};

    // Regra 255
    try {
      const output255 = path.join(outputDir, 'saida255.txt');
      await processarArquivo255Telhaco(inputExcelPath, output255);
      await this.uploadIfNotEmpty('regra255', output255, codigoSistema, result);
    } catch {}
    

    // Regra 257-1
    try {
      const output2571 = path.join(outputDir, 'saida257-1.txt');
      await processarArquivos257_1Telhaco(inputExcelPath, output2571);
      await this.uploadIfNotEmpty('regra257_1', output2571, codigoSistema, result);
    } catch {}

    // Regra 257_2
    try {
      const output2572 = path.join(outputDir, 'saida257_2.txt');
      await processarArquivos257_2Telhaco(inputExcelPath, output2572);
      await this.uploadIfNotEmpty('regra257_2', output2572, codigoSistema, result);
    } catch {}

    // Regra 282
    try {
      const output282 = path.join(outputDir, 'saida282.txt');
      await processarArquivo282Telhaco(inputExcelPath, output282);
      await this.uploadIfNotEmpty('regra282', output282, codigoSistema, result);
    } catch {}

    // Regra 283
    try {
      const output283 = path.join(outputDir, 'saida283.txt');
      await processarArquivo283Telhaco(inputExcelPath, output283);
      await this.uploadIfNotEmpty('regra283', output283, codigoSistema, result);
    } catch {}

    // Regra 284
    try {
      const output284 = path.join(outputDir, 'saida284.txt');
      await processarArquivo284_1Telhaco(inputExcelPath, output284);
      await this.uploadIfNotEmpty('regra284', output284, codigoSistema, result);
    } catch {}

    // Regra 328
    try {
      const output328 = path.join(outputDir, 'saida328.txt');
      await processarArquivo328Telhaco(inputExcelPath, output328);
      await this.uploadIfNotEmpty('regra328', output328, codigoSistema, result);
    } catch {}

    // Regra 329
    try {
      const output329 = path.join(outputDir, 'saida329.txt');
      await processarArquivo329Telhaco(inputExcelPath, output329);
      await this.uploadIfNotEmpty('regra329', output329, codigoSistema, result);
    } catch {}

    // Regra 335
    try {
      const output335 = path.join(outputDir, 'saida335.txt');
      await processarArquivo335Telhaco(inputExcelPath, output335);
      await this.uploadIfNotEmpty('regra335', output335, codigoSistema, result);
    } catch {}

    // Regra 336
    try {
      const output336 = path.join(outputDir, 'saida336.txt');
      await processarArquivo336Telhaco(inputExcelPath, output336);
      await this.uploadIfNotEmpty('regra336', output336, codigoSistema, result);
    } catch {}

    // Regra 337
    try {
      const output337 = path.join(outputDir, 'saida337.txt');
      await processarArquivo337Telhaco(inputExcelPath, output337);
      await this.uploadIfNotEmpty('regra337', output337, codigoSistema, result);
    } catch {}

    // Regra 347
    try {
      const output347 = path.join(outputDir, 'saida347.txt');
      await processarArquivo347Telhaco(inputExcelPath, output347);
      await this.uploadIfNotEmpty('regra347', output347, codigoSistema, result);
    } catch {}

    // Regra 349
    try {
      const output349 = path.join(outputDir, 'saida349.txt');
      await processarArquivo349Telhaco(inputExcelPath, output349);
      await this.uploadIfNotEmpty('regra349', output349, codigoSistema, result);
    } catch {}

    // Regra 350
    try {
      const output350 = path.join(outputDir, 'saida350.txt');
      await processarArquivo350Telhaco(inputExcelPath, output350);
      await this.uploadIfNotEmpty('regra350', output350, codigoSistema, result);
    } catch {}

    return result;
  }

  async processRegra289(
    pagamentosPath: string,
    duplicatasPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<{ [key: string]: string }> {
    const result: { [key: string]: string } = {};
    try {
      // Executa o processamento específico da regra 289
      const { contabil, fiscal, duplicatas } =
        await processarArquivo289Telhacao(pagamentosPath, duplicatasPath);

      // Define os caminhos para os arquivos de saída
      const outputContabilPath = path.join(outputDir, 'contabil289_np.txt');
      const outputFiscalPath = path.join(outputDir, 'fiscal289_np.txt');
      const outputDuplicatasPath = path.join(
        outputDir,
        'duplicatas_nao_encontradas289_np.xlsx',
      );

      // Exporta os arquivos TXT
      // Exporta os arquivos TXT
      exportToTxt289(contabil, outputContabilPath);
      exportToTxt289(fiscal, outputFiscalPath);

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
          { encoding: 'utf8' },
        );
      }

      const fileBufferContabil = fs.readFileSync(outputContabilPath);
      let uploadResult = await this.supabaseService.uploadProcessedFile(
        outputContabilPath,
        fileBufferContabil,
        codigoSistema,
      );
      result['regra289_contabil'] = uploadResult.error
        ? `Erro ao enviar: ${uploadResult.error.message}`
        : uploadResult.supabasePath;

      const fileBufferFiscal = fs.readFileSync(outputFiscalPath);
      uploadResult = await this.supabaseService.uploadProcessedFile(
        outputFiscalPath,
        fileBufferFiscal,
        codigoSistema,
      );
      result['regra289_fiscal'] = uploadResult.error
        ? `Erro ao enviar: ${uploadResult.error.message}`
        : uploadResult.supabasePath;

      const fileBufferDuplicatas = fs.readFileSync(outputDuplicatasPath);
      uploadResult = await this.supabaseService.uploadProcessedFile(
        outputDuplicatasPath,
        fileBufferDuplicatas,
        codigoSistema,
      );
      result['regra289_duplicatas'] = uploadResult.error
        ? `Erro ao enviar: ${uploadResult.error.message}`
        : uploadResult.supabasePath;

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
    codigoSistema: string,
  ): Promise<{ [key: string]: string }> {
    const result: { [key: string]: string } = {};
    try {
      const outputContabilPath = path.join(outputDir, 'contabil326_np.txt');
      const outputFiscalPath = path.join(outputDir, 'fiscal326_np.txt');
      const outputDuplicatasPath = path.join(
        outputDir,
        'duplicatas_nao_encontradas326_np.xlsx',
      );

      await Processador326.processarArquivo326(
        pagamentosPath,
        duplicatasPath,
        outputContabilPath,
        outputFiscalPath,
        outputDuplicatasPath,
      );

      const fileBufferContabil = fs.readFileSync(outputContabilPath);
      let uploadResult = await this.supabaseService.uploadProcessedFile(
        outputContabilPath,
        fileBufferContabil,
        codigoSistema,
      );
      result['regra326_contabil'] = uploadResult.error
        ? `Erro ao enviar: ${uploadResult.error.message}`
        : uploadResult.supabasePath;

      const fileBufferFiscal = fs.readFileSync(outputFiscalPath);
      uploadResult = await this.supabaseService.uploadProcessedFile(
        outputFiscalPath,
        fileBufferFiscal,
        codigoSistema,
      );
      result['regra326_fiscal'] = uploadResult.error
        ? `Erro ao enviar: ${uploadResult.error.message}`
        : uploadResult.supabasePath;

      const fileBufferDuplicatas = fs.readFileSync(outputDuplicatasPath);
      uploadResult = await this.supabaseService.uploadProcessedFile(
        outputDuplicatasPath,
        fileBufferDuplicatas,
        codigoSistema,
      );
      result['regra326_duplicatas'] = uploadResult.error
        ? `Erro ao enviar: ${uploadResult.error.message}`
        : uploadResult.supabasePath;

      return result;
    } catch (error) {
      console.error('Erro no processamento da regra 326:', error);
      throw error;
    }
  }

  async processPagamentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabasePath: SupabaseService,
  ): Promise<{ [key: string]: string }> {
    return { message: 'TELHAÇO - pagamentos ainda não implementado' };
  }

  async processRecebimentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<{ [key: string]: string }> {
    return { message: 'TELHAÇO - recebimentos ainda não implementado...' };
  }
}
