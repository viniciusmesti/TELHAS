import { processarArquivo328 } from './ProcessarArquivo328';

const inputExcelPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\uploads\\328.xlsx';
const outputTxtPath =
  'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\N&P\\saida\\saida328.txt';

(async () => {
  try {
    console.log('🚀 Iniciando processamento da Regra 328...');
    await processarArquivo328(inputExcelPath, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
    console.log(`📂 Arquivo gerado: ${outputTxtPath}`);
  } catch (error) {
    console.error('❌ Erro ao executar o teste:', error);
  }
})();
