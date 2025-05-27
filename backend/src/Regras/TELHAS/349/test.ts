import { processarArquivo349 } from './ProcessarArquivo349';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 349 para TELHAS...');
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'uploads', '349.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'saida', 'saida349.txt');
    
    // Certifica-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await processarArquivo349(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 349 para TELHAS concluído com sucesso! Verifique o arquivo:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 349 para TELHAS:', error);
  }
}

testarProcessamento();
