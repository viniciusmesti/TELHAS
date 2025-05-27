import { processarArquivo284_2 } from './ProcessarArquivo284_2';
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
      'MAPA',
      'uploads',
      '284-2.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida284-2.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo284_2(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 284-1 concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 284-1:', error);
  }
}

testarProcessamento();
