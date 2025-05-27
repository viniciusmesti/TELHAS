import * as path from 'path';
import { processarArquivo257_2 } from './ProcessarArquivo257_2';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 257/2 para a empresa TELHAS...');

    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'uploads',
      '257_2.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'TELHAS',
      'saida',
      'saida257_2.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo257_2(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da Regra 257/2 concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro no teste da Regra 257/2:', error);
  }
}

testarProcessamento();
