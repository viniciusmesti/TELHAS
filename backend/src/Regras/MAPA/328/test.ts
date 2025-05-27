import { processarArquivo328 } from './ProcessarArquivo328';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'MAPA', 'uploads', '328.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'MAPA', 'saida', 'saida328.txt');
    
    // Certifique-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await processarArquivo328(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 328 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 328:', error);
  }
}

testarProcessamento();
