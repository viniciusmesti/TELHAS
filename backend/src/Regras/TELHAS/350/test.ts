// test.ts

import { processarArquivo350 } from './ProcessarArquivo350';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 350 para TELHAS...');
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'uploads',
      '350.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'saida',
      'saida350.txt',
    );

    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo350(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 350 para TELHAS concluído com sucesso! Verifique o arquivo:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 350 para TELHAS:', error);
  }
}

testarProcessamento();
