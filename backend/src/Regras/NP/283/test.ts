import { processarArquivo283 } from './ProcessarArquivo283';

const processarArquivo = processarArquivo283;

// Caminho do arquivo Excel de entrada
const inputExcelPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\uploads\\283.xlsx';

// Caminho do arquivo TXT de saída
const outputTxtPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\saida\\saida283.txt';

(async () => {
  try {
    console.log('🚀 Iniciando processamento da Regra 255...');
    await processarArquivo283(inputExcelPath, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
    console.log(`📂 Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error);
  }
})();
