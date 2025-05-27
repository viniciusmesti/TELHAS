import { processarArquivo329 } from './ProcessarArquivo329';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra 329 para TELHAS CASCAVEL...');
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'uploads', '329.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAS', 'saida', 'saida329.txt');
    
    // Certifique-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await processarArquivo329(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 329 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 329:', error);
  }
}

testarProcessamento();
