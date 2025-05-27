import { processarArquivo257_2 } from './processarArquivos257_2';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 257-2...');
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'uploads',
      '257-2.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida257-2.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo257_2(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 257-2 concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 257-2:', error);
  }
}

testarProcessamento();
