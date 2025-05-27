// src/Regras/MAPA/257-1/test.ts
import * as path from 'path';
import { processarArquivos257_1 } from './processarArquivo257_1';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 257-1...');
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'uploads',
      '257-1.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida257-1.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivos257_1(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 257‑1 concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 257-1:', error);
  }
}

testarProcessamento();
