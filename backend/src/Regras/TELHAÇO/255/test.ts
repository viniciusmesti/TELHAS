import * as path from 'path';
import { processarArquivo255 } from './ProcessarArquivo255';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da Regra 255 para a empresa TELHAÇO...');
    
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'uploads', '255.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'saida', 'saida255.txt');

    // Certifique-se de que o diretório de saída existe:
    const fs = require('fs');
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo255(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 255 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro no teste da Regra 255:', error);
  }
}

testarProcessamento();
