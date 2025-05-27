import { processarArquivo337 } from './ProcessarArquivo337';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 337 para TELHAS...');
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'uploads', '337.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'saida', 'saida337.txt');
    
    // Garante que o diretório de saída exista
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await processarArquivo337(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 337 para TELHAS concluído com sucesso! Verifique o arquivo:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 337 para TELHAS:', error);
  }
}

testarProcessamento();
