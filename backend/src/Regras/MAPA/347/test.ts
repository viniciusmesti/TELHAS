import { processarArquivo347 } from './ProcessarArquivo347';
import * as path from 'path';
import * as fs from 'fs';

async function test() {
  try {
    console.log('Iniciando o teste da Regra 347...');
    const inputExcelPath = path.join(__dirname, '..', '..', '..', 'uploads', 'MAPA', 'uploads', '347.xlsx');
    const outputTxtPath = path.join(__dirname, '..', '..', '..', 'uploads', 'MAPA', 'saida', 'saida347.txt');


    const outputDir = path.dirname(outputTxtPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await processarArquivo347(inputExcelPath, outputTxtPath);
    console.log('Teste da Regra 347 concluído com sucesso!');
    console.log(`Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('Erro no teste da Regra 347:', error);
  }
}

test();
