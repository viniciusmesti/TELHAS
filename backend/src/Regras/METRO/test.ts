import * as path from 'path';
import { processarSalarioExcel, exportarTxt } from './processarArquivo';

async function testarProcessamentoMetro() {
  const inputPath = path.join(__dirname, '../../uploads/METRO/01 2025.xlsx');
  const outputContabil = path.join(
    __dirname,
    '../../uploads/METRO/saida/contabil_metro.txt'
  );
  const outputFiscal = path.join(
    __dirname,
    '../../uploads/METRO/saida/fiscal_metro.txt'
  );

  try {
    console.log('🚀 Iniciando processamento METRO...');
    const { contabeis, fiscais } = processarSalarioExcel(inputPath);

    // Gera o arquivo de saída contábil
    exportarTxt(contabeis, outputContabil);

    // Gera o arquivo de saída fiscal
    exportarTxt(fiscais, outputFiscal);

    console.log('🎉 Processamento finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no processamento METRO:', error);
  }
}

testarProcessamentoMetro();
