import { processarArquivo347 } from './ProcessarArquivo347';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAÇO',
      'uploads',
      '347.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAÇO',
      'saida',
      'saida347.txt',
    );

    // Certifica-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo347(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 347 concluído com sucesso! Verifique o arquivo:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 347:', error);
  }
}

testarProcessamento();
