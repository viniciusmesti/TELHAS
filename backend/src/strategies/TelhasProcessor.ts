import { Injectable } from '@nestjs/common';
import { IEmpresaProcessor } from './IEmpresaProcessor';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

import { processarArquivo255 as processarArquivo255Telhas } from 'src/Regras/TELHAS/255/ProcessarArquivo255';
import { processarArquivos257_1 as processarArquivos257_1Telhas } from 'src/Regras/TELHAS/257-1/ProcessarArquivo257_1';
import { processarArquivo257_2 as processarArquivo257_2Telhas } from 'src/Regras/TELHAS/257-2/ProcessarArquivo257_2';
import { processarArquivo282 as processarArquivo282Telhas } from 'src/Regras/TELHAS/282/ProcessarArquivo282';
import { processarArquivo283 as processarArquivo283Telhas } from 'src/Regras/TELHAS/283/ProcessarArquivo283';
import { processarArquivo284 as processarArquivo284_1Telhas } from 'src/Regras/TELHAS/284_1/ProcessarArquivo284';
import { processarArquivo328 as processarArquivo328Telhas } from 'src/Regras/TELHAS/328/ProcessarArquivo328';
import { processarArquivo329 as processarArquivo329Telhas } from 'src/Regras/TELHAS/329/ProcessarArquivo329';
import { processarArquivo335 as processarArquivo335Telhas } from 'src/Regras/TELHAS/335/ProcessarArquivo335';
import { processarArquivo336 as processarArquivo336Telhas } from 'src/Regras/TELHAS/336/ProcessarArquivo336';
import { processarArquivo337 as processarArquivo337Telhas } from 'src/Regras/TELHAS/337/ProcessarArquivo337';
import { processarArquivo347 as processarArquivo347Telhas } from 'src/Regras/TELHAS/347/ProcessarArquivo347';
import { processarArquivo349 as processarArquivo349Telhas } from 'src/Regras/TELHAS/349/ProcessarArquivo349';
import { processarArquivo350 as processarArquivo350 } from 'src/Regras/TELHAS/350/ProcessarArquivo350';
import { exportToTxt289 } from 'src/Regras/TELHAÇO/289/ProcessarArquivo289';
import { Processador326 } from 'src/Regras/TELHAS/326/ProcessarArquivo326';
import { processarArquivo289Telhas } from 'src/Regras/TELHAS/289/processarArquivo289';
import { ProcessedInfo, uploadIfNotEmpty } from '../utils/upload';

@Injectable()
export class TelhasProcessor implements IEmpresaProcessor {
  constructor(private readonly supabaseService: SupabaseService) {}


  async processUnificado(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<Record<string, ProcessedInfo>> {
    const result: Record<string, ProcessedInfo> = {};

    // Regra 255
    try {
      const output255 = path.join(outputDir, 'saida255.txt');
      await processarArquivo255Telhas(inputExcelPath, output255);
      await uploadIfNotEmpty(this.supabaseService, 'regra255', output255, codigoSistema, result);
    } catch {}

    //257_1
    try {
      const output257_1 = path.join(outputDir, 'saida257_1.txt');
      await processarArquivos257_1Telhas(inputExcelPath, output257_1);
      await uploadIfNotEmpty(this.supabaseService, 'regra257_1', output257_1, codigoSistema, result);
    } catch {}

    //257_2
    try {
      const output257_2 = path.join(outputDir, 'saida257_2.txt');
      await processarArquivo257_2Telhas(inputExcelPath, output257_2);
      await uploadIfNotEmpty(this.supabaseService, 'regra257_2', output257_2, codigoSistema, result);
    } catch {}

    //282
    try {
      const output282 = path.join(outputDir, 'saida282.txt');
      await processarArquivo282Telhas(inputExcelPath, output282);
      await uploadIfNotEmpty(this.supabaseService, 'regra282', output282, codigoSistema, result);
    } catch {}

    //283
    try {
      const output283 = path.join(outputDir, 'saida283.txt');
      await processarArquivo283Telhas(inputExcelPath, output283);
      await uploadIfNotEmpty(this.supabaseService, 'regra283', output283, codigoSistema, result);
    } catch {}

    //284
    try {
      const output284 = path.join(outputDir, 'saida284.txt');
      await processarArquivo284_1Telhas(inputExcelPath, output284);
      await uploadIfNotEmpty(this.supabaseService, 'regra284', output284, codigoSistema, result);
    } catch {}

    // 328
    try {
      const output328 = path.join(outputDir, 'saida328.txt');
      await processarArquivo328Telhas(inputExcelPath, output328);
      await uploadIfNotEmpty(this.supabaseService, 'regra328', output328, codigoSistema, result);
    } catch {}

    // 329
    try {
      const output329 = path.join(outputDir, 'saida329.txt');
      await processarArquivo329Telhas(inputExcelPath, output329);
      await uploadIfNotEmpty(this.supabaseService, 'regra329', output329, codigoSistema, result);
    } catch {}

    // 335
    try {
      const output335 = path.join(outputDir, 'saida335.txt');
      await processarArquivo335Telhas(inputExcelPath, output335);
      await uploadIfNotEmpty(this.supabaseService, 'regra335', output335, codigoSistema, result);
    } catch {}

    // 336
    try {
      const output336 = path.join(outputDir, 'saida336.txt');
      await processarArquivo336Telhas(inputExcelPath, output336);
      await uploadIfNotEmpty(this.supabaseService, 'regra336', output336, codigoSistema, result);
    } catch {}

    // 337
    try {
      const output337 = path.join(outputDir, 'saida337.txt');
      await processarArquivo337Telhas(inputExcelPath, output337);
      await uploadIfNotEmpty(this.supabaseService, 'regra337', output337, codigoSistema, result);
    } catch {}

    // 347
    try {
      const output347 = path.join(outputDir, 'saida347.txt');
      await processarArquivo347Telhas(inputExcelPath, output347);
      await uploadIfNotEmpty(this.supabaseService, 'regra347', output347, codigoSistema, result);
    } catch {}

    // 349
    try {
      const output349 = path.join(outputDir, 'saida349.txt');
      await processarArquivo349Telhas(inputExcelPath, output349);
      await uploadIfNotEmpty(this.supabaseService, 'regra349', output349, codigoSistema, result);
    } catch {}

    // 350
    try {
      const output350 = path.join(outputDir, 'saida350.txt');
      await processarArquivo350(inputExcelPath, output350);
      await uploadIfNotEmpty(this.supabaseService, 'regra350', output350, codigoSistema, result);
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

    const { contabil, fiscal, duplicatas } = await processarArquivo289Telhas(
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
    return { message: 'TELHAS = pagamentos ainda nao implementado' };
  }

  async processRecebimentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<{ [key: string]: string }> {
    return { message: 'TELHAS = recebimentos ainda nao implementado' };
  }
}
