import { processarArquivo282 } from './ProcessarArquivo282';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 282...');
    // Ajuste os caminhos conforme sua estrutura:
    const inputExcelPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'uploads',
      '282.xlsx',
    );
    const outputTxtPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'MAPA',
      'saida',
      'saida282.txt',
    );

    // Certifique-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo282(inputExcelPath, outputTxtPath);
    console.log(
      'Teste da regra 282 concluído com sucesso! Verifique o arquivo de saída:',
      outputTxtPath,
    );
  } catch (error) {
    console.error('Erro durante o teste da regra 282:', error);
  }
}

testarProcessamento();
