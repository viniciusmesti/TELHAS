import { processarArquivo336 } from './ProcessarArquivo336';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    // Ajuste os caminhos conforme sua estrutura
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAÇO',
      'uploads',
      '336.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAÇO',
      'saida',
      'saida336.txt',
    );

    // Certifica-se de que o diretório de saída existe
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo336(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 336 concluído com sucesso! Verifique o arquivo:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 336:', error);
  }
}

testarProcessamento();
