import { processarArquivo336 } from './ProcessarArquivo336';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 336 (TELHAS)...');

    // Ajuste os caminhos conforme sua estrutura de pastas
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'uploads',
      '336.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'saida',
      'saida336.txt',
    );

    // Garante a existência do diretório de saída
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Executa o processamento
    await processarArquivo336(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da Regra 336 (TELHAS) concluído com sucesso! Verifique o arquivo:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da Regra 336 (TELHAS):', error);
  }
}

testarProcessamento();
