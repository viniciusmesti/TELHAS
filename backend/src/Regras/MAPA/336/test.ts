import { processarArquivo336 } from './ProcessarArquivo336';
import * as path from 'path';
import * as fs from 'fs';

async function test() {
  try {
    console.log('Iniciando o teste da Regra 336...');
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'MAPA', 'uploads', '336.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'MAPA', 'saida', 'saida336.txt');

    // Certifica-se de que o diretório de saída existe:
    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo336(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 336 concluído com sucesso!');
    console.log(`Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('Erro no teste da Regra 336:', error);
  }
}

test();
