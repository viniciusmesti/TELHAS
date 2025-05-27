import * as path from 'path';
import { processarArquivo283 } from './ProcessarArquivo283';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 283 para a empresa TELHAÇO...');
    
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'uploads', '283.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'saida', 'saida283.txt');

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo283(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 283 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro no teste da Regra 283:', error);
  }
}

testarProcessamento();
