import { processarArquivo349 } from './ProcessarArquivo349';
import * as path from 'path';
import * as fs from 'fs';

async function test() {
  try {
    console.log('Iniciando o teste da Regra 349...');
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'uploads',
      '349.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida349.txt',
    );

    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo349(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 349 concluído com sucesso!');
    console.log(`Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('Erro no teste da Regra 349:', error);
  }
}

test();
