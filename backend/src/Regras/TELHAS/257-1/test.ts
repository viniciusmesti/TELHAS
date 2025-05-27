import * as path from 'path';
import { processarArquivos257_1 } from './ProcessarArquivo257_1';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 257/1 para a empresa TELHAS...');

    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'uploads',
      '257_1.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'saida',
      'saida257_1.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivos257_1(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da Regra 257/1 concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro no teste da Regra 257/1:', error);
  }
}

testarProcessamento();
