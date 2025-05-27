import { processarArquivos257_1 } from './ProcessarArquivo257_1';

const processarArquivo = processarArquivos257_1;

// Caminho do arquivo Excel de entrada
const inputExcelPath = 'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\uploads\\257-1.xlsx';

// Caminho do arquivo TXT de saída
const outputTxtPath = 'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\saida\\saida257-1.txt';

(async () => {
  try {
    console.log('🚀 Iniciando processamento da Regra 255...');
    await processarArquivo(inputExcelPath, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
    console.log(`📂 Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error);
  }
})();
