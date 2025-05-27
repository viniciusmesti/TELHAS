import { processarArquivo337 } from './ProcessarArquivo337';

// Caminho do arquivo Excel de entrada
const inputExcelPath = 'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\uploads\\337.xlsx';

// Caminho do arquivo TXT de saída
const outputTxtPath = 'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\saida\\saida337.txt';

(async () => {
  try {
    console.log('Iniciando processamento da Regra 326...');
    await processarArquivo337(inputExcelPath, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
    console.log(`📂 Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error);
  }
})();