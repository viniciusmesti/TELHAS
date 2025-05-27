import { processarArquivo282 } from './ProcessarArquivo282';

const processarArquivo = processarArquivo282;

// Caminho do arquivo Excel de entrada
const inputExcelPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\uploads\\282.xlsx';

// Caminho do arquivo TXT de saída
const outputTxtPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\saida\\saida282.txt';

(async () => {
  try {
    console.log('🚀 Iniciando processamento da Regra 255...');
    await processarArquivo282(inputExcelPath, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
    console.log(`📂 Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error);
  }
})();
