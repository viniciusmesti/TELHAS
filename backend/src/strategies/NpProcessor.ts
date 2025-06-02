import { Injectable } from '@nestjs/common';
import { IEmpresaProcessor } from './IEmpresaProcessor';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

import { processarArquivo255 as processarArquivo255Np } from '../Regras/NP/255/ProcessarArquivo255';
import { processarArquivos257_1 as processarArquivo257_1Np } from '../Regras/NP/257-1/ProcessarArquivo257_1';
import { processarArquivo257_2 as processarArquivo257_2Np } from 'src/Regras/NP/257-2/ProcessarArquivo257-2';
import { processarArquivo282 as processarArquivo282Np } from 'src/Regras/NP/282/ProcessarArquivo282';
import { processarArquivo283 as processarArquivo283Np } from 'src/Regras/NP/283/ProcessarArquivo283';
import { processarArquivo284 as processarArquivo284Np } from 'src/Regras/NP/284-1/ProcessarArquivo284';
import { processarArquivo328 as processarArquivo328Np } from 'src/Regras/NP/328/ProcessarArquivo328';
import { processarArquivo329 as processarArquivo329Np } from 'src/Regras/NP/329/ProcessarArquivo329';
import { processarArquivo335 as processarArquivo335Np } from 'src/Regras/NP/335/ProcessarArquivo335';
import { processarArquivo336 as processarArquivo336Np } from 'src/Regras/NP/336/ProcessarArquivo336';
import { processarArquivo337 as processarArquivo337Np } from 'src/Regras/NP/337/ProcessarArquivo337';
import { processarArquivo347 as processarArquivo347Np } from 'src/Regras/NP/347/processarArquivo347';
import { processarArquivo349 as processarArquivo349Np } from 'src/Regras/NP/349/ProcessarArquivo349';
import { processarArquivo350 as processarArquivo350Np } from 'src/Regras/NP/350/ProcessarArquivo350';
import { processarArquivo289NP } from 'src/Regras/NP/289/ProcessarArquivo289';
import { Processador326 } from 'src/Regras/NP/326/ProcessarArquivo326';
import { exportToTxt289 } from 'src/Regras/NP/289/ProcessarArquivo289';

interface ProcessedInfo {
  path: string;
  size: number;
}

@Injectable()
export class NpProcessor implements IEmpresaProcessor {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async uploadIfNotEmpty(
    key: string,
    filePath: string,
    codigoSistema: string,
    result: Record<string, ProcessedInfo>,
  ) {
    const stats = fs.statSync(filePath);
    if (stats.size > 0) {
      const fileBuffer = fs.readFileSync(filePath);
      const { supabasePath } = await this.supabaseService.uploadProcessedFile(
        filePath,
        fileBuffer,
        codigoSistema,
      );
      result[key] = {
        path: supabasePath,
        size: stats.size,
      };
    } else {
      fs.unlinkSync(filePath);
    }
  }

  async processUnificado(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<Record<string, ProcessedInfo>> {
    const result: Record<string, ProcessedInfo> = {};

    // Processamento de várias regras unificadas
    try {
      const out255 = path.join(outputDir, 'saida255.txt');
      await processarArquivo255Np(inputExcelPath, out255);
      await this.uploadIfNotEmpty('regra255', out255, codigoSistema, result);
    } catch {}

    try {
      const out2571 = path.join(outputDir, 'saida257-1.txt');
      await processarArquivo257_1Np(inputExcelPath, out2571);
      await this.uploadIfNotEmpty('regra257_1', out2571, codigoSistema, result);
    } catch {}

    try {
      const out2572 = path.join(outputDir, 'saida257-2.txt');
      await processarArquivo257_2Np(inputExcelPath, out2572);
      await this.uploadIfNotEmpty('regra257_2', out2572, codigoSistema, result);
    } catch {}

    try {
      const out282 = path.join(outputDir, 'saida282.txt');
      await processarArquivo282Np(inputExcelPath, out282);
      await this.uploadIfNotEmpty('regra282', out282, codigoSistema, result);
    } catch {}

    try {
      const out283 = path.join(outputDir, 'saida283.txt');
      await processarArquivo283Np(inputExcelPath, out283);
      await this.uploadIfNotEmpty('regra283', out283, codigoSistema, result);
    } catch {}

    try {
      const out284 = path.join(outputDir, 'saida284.txt');
      await processarArquivo284Np(inputExcelPath, out284);
      await this.uploadIfNotEmpty('regra284', out284, codigoSistema, result);
    } catch {}

    try {
      const out328 = path.join(outputDir, 'saida328.txt');
      await processarArquivo328Np(inputExcelPath, out328);
      await this.uploadIfNotEmpty('regra328', out328, codigoSistema, result);
    } catch {}

    try {
      const out329 = path.join(outputDir, 'saida329.txt');
      await processarArquivo329Np(inputExcelPath, out329);
      await this.uploadIfNotEmpty('regra329', out329, codigoSistema, result);
    } catch {}

    try {
      const out335 = path.join(outputDir, 'saida335.txt');
      await processarArquivo335Np(inputExcelPath, out335);
      await this.uploadIfNotEmpty('regra335', out335, codigoSistema, result);
    } catch {}

    try {
      const out336 = path.join(outputDir, 'saida336.txt');
      await processarArquivo336Np(inputExcelPath, out336);
      await this.uploadIfNotEmpty('regra336', out336, codigoSistema, result);
    } catch {}

    try {
      const out337 = path.join(outputDir, 'saida337.txt');
      await processarArquivo337Np(inputExcelPath, out337);
      await this.uploadIfNotEmpty('regra337', out337, codigoSistema, result);
    } catch {}

    try {
      const out347 = path.join(outputDir, 'saida347.txt');
      await processarArquivo347Np(inputExcelPath, out347);
      await this.uploadIfNotEmpty('regra347', out347, codigoSistema, result);
    } catch {}

    try {
      const out349 = path.join(outputDir, 'saida349.txt');
      await processarArquivo349Np(inputExcelPath, out349);
      await this.uploadIfNotEmpty('regra349', out349, codigoSistema, result);
    } catch {}

    try {
      const out350 = path.join(outputDir, 'saida350.txt');
      await processarArquivo350Np(inputExcelPath, out350);
      await this.uploadIfNotEmpty('regra350', out350, codigoSistema, result);
    } catch {}

    return result;
  }

  async processRegra289(
    pagamentosPath: string,
    duplicatasPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<Record<string, { path: string; size: number }>> {
    const result: Record<string, { path: string; size: number }> = {};

    const { contabil, fiscal, duplicatas } = await processarArquivo289NP(
      pagamentosPath,
      duplicatasPath,
    );

    const outputContabilPath   = path.join(outputDir, 'contabil289_np.txt');
    const outputFiscalPath     = path.join(outputDir, 'fiscal289_np.txt');
    const outputDuplicatasPath = path.join(
      outputDir,
      'duplicatas_nao_encontradas289_np.xlsx',
    );

    exportToTxt289(contabil, outputContabilPath);
    exportToTxt289(fiscal,   outputFiscalPath);

    if (duplicatas.length > 0) {
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(duplicatas);
      xlsx.utils.book_append_sheet(wb, ws, 'Duplicatas');
      xlsx.writeFile(wb, outputDuplicatasPath);
    } else {
      fs.writeFileSync(
        outputDuplicatasPath,
        'Arquivo gerado automaticamente, mas não há duplicatas não encontradas.\r\n',
        'utf8',
      );
    }

    const statContabil   = fs.statSync(outputContabilPath);
    const bufContabil    = fs.readFileSync(outputContabilPath);
    const upContabil     = await this.supabaseService.uploadProcessedFile(
      outputContabilPath,
      bufContabil,
      codigoSistema,
    );
    result['regra289_contabil']  = { path: upContabil.supabasePath, size: statContabil.size };

    const statFiscal     = fs.statSync(outputFiscalPath);
    const bufFiscal      = fs.readFileSync(outputFiscalPath);
    const upFiscal       = await this.supabaseService.uploadProcessedFile(
      outputFiscalPath,
      bufFiscal,
      codigoSistema,
    );
    result['regra289_fiscal']    = { path: upFiscal.supabasePath, size: statFiscal.size };

    const statDuplicatas = fs.statSync(outputDuplicatasPath);
    const bufDuplicatas  = fs.readFileSync(outputDuplicatasPath);
    const upDuplicatas   = await this.supabaseService.uploadProcessedFile(
      outputDuplicatasPath,
      bufDuplicatas,
      codigoSistema,
    );
    result['regra289_duplicatas']= { path: upDuplicatas.supabasePath, size: statDuplicatas.size };

    return result;
  }

  async processRegra326(
    pagamentosPath: string,
    duplicatasPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<Record<string, { path: string; size: number }>> {
    const result: Record<string, { path: string; size: number }> = {};

    await Processador326.processarArquivo326(
      pagamentosPath,
      duplicatasPath,
      path.join(outputDir, 'contabil326_np.txt'),
      path.join(outputDir, 'fiscal326_np.txt'),
      path.join(outputDir, 'duplicatas_nao_encontradas326_np.xlsx'),
    );

    const files = [
      { key: 'regra326_contabil',   name: 'contabil326_np.txt' },
      { key: 'regra326_fiscal',     name: 'fiscal326_np.txt' },
      { key: 'regra326_duplicatas', name: 'duplicatas_nao_encontradas326_np.xlsx' },
    ];

    for (const { key, name } of files) {
      const fullPath = path.join(outputDir, name);
      const stat     = fs.statSync(fullPath);
      const buffer   = fs.readFileSync(fullPath);

      const up = await this.supabaseService.uploadProcessedFile(
        fullPath,
        buffer,
        codigoSistema,
      );

      result[key] = { path: up.supabasePath, size: stat.size };
    }

    return result;
  }

  async processPagamentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabaseService: SupabaseService,
  ): Promise<{ [key: string]: string }> {
    return { message: 'N&P - pagamentos ainda não implementado...' };
  }

  async processRecebimentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<{ [key: string]: string }> {
    return { message: 'N&P - recebimentos ainda não implementado...' };
  }
}
