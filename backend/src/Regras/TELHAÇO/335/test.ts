import { processarArquivo335 } from './ProcessarArquivo335';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    // Ajuste os caminhos conforme sua estrutura de pastas
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'uploads', '335.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'saida', 'saida335.txt');
    
    // Certifica-se de que o diretório de saída existe
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await processarArquivo335(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 335 concluído com sucesso! Verifique o arquivo de saída:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 335:', error);
  }
}

testarProcessamento();
