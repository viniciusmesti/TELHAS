import { processarArquivo284 } from './ProcessarArquivo284';

const processarArquivo = processarArquivo284;

const inputExcelPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\TELHAS\\uploads\\284.xlsx';

const outputTxtPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\TELHAS\\saida\\saida284.txt';

(async () => {
  try {
    console.log('🚀 Iniciando processamento da Regra 255...');
    await processarArquivo284(inputExcelPath, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
    console.log(`📂 Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error);
  }
})();
