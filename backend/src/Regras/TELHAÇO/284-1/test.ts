import * as path from 'path';
import { processarArquivo284 } from './ProcessarArquivo284_1';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 284/1 para a empresa TELHAÇO...');
    
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'uploads', '284_1.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'saida', 'saida284_1.txt');

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo284(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 284/1 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro no teste da Regra 284/1:', error);
  }
}

testarProcessamento();
