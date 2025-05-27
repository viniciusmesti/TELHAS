import { processarArquivo350 } from './ProcessarArquivo350';
import * as path from 'path';
import * as fs from 'fs';

async function test() {
  try {
    console.log('Iniciando o teste da Regra 350...');
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'uploads',
      '350.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida350.txt',
    );

    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo350(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 350 concluído com sucesso!');
    console.log(`Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('Erro no teste da Regra 350:', error);
  }
}

test();
