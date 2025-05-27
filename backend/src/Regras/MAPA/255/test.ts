import * as path from 'path';
import { processarArquivo255 } from './processarArquivo255';

async function test() {
  try {
    // Caminho de entrada: 3 níveis para voltar até a pasta "src"
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'uploads',
      '255.xlsx',
    );

    // Caminho de saída: também 3 níveis para voltar até "src", depois "uploads/MAPA/saida"
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida255.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo255(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 255 concluído com sucesso!');
  } catch (error) {
    console.error('Erro no teste da regra 255:', error);
  }
}

test();
