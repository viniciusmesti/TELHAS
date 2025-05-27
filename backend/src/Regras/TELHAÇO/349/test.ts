import { processarArquivo349 } from './ProcessarArquivo349';
import * as path from 'path';
import * as fs from 'fs';

async function testarProcessamento() {
  try {
    // Ajuste os caminhos conforme sua estrutura de pastas:
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'uploads', '349.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'TELHAÇO', 'saida', 'saida349.txt');
    
    // Certifica-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await processarArquivo349(inputExcelPath, outputTxtPath);
    console.log('Teste da regra 349 concluído com sucesso! Verifique o arquivo:', outputTxtPath);
  } catch (error) {
    console.error('Erro durante o teste da regra 349:', error);
  }
}

testarProcessamento();
