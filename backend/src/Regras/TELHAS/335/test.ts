import { processarArquivo335 } from './ProcessarArquivo335';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 335 para TELHAS...');
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'uploads',
      '335.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'saida',
      'saida335.txt',
    );

    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo335(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 335 para TELHAS concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 335 para TELHAS:', error);
  }
}

testarProcessamento();
