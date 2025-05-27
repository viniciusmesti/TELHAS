import { processarArquivo347 } from './ProcessarArquivo347';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 347 para TELHAS...');
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'uploads', '347.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'saida', 'saida347.txt');

    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo347(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 347 para TELHAS concluído com sucesso! Verifique o arquivo:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 347 para TELHAS:', error);
  }
}

testarProcessamento();
