import * as path from 'path';
import { processarArquivo284 } from './ProcessarArquivo284_2';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 284/2 para a empresa TELHAÇO...');
    
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'uploads', '284_2.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'saida', 'saida284_2.txt');

    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo284(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 284/2 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro no teste da Regra 284/2:', error);
  }
}

testarProcessamento();
