import * as path from 'path';
import * as fs from 'fs';
import { processarSalarioExcel, exportToTxt } from './processarArquivo';

async function testarProcessamentoMetro() {
  const inputPath = path.join(__dirname, '../../uploads/METRO/01 2025.xlsx');
  const exportacaoPath = path.join(__dirname, '../../uploads/METRO/Exportacao.xlsx');
  const outputDir = path.join(__dirname, '../../uploads/METRO/saida');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputContabil = path.join(outputDir, 'contabil_metro.txt');
  const outputFiscal = path.join(outputDir, 'fiscal_metro.txt');

  try {
    console.log('🚀 Iniciando processamento METRO...');
    const { contabeis, fiscais } = processarSalarioExcel(inputPath, exportacaoPath);

    exportToTxt(contabeis, outputContabil);
    exportToTxt(fiscais, outputFiscal);

    console.log('🎉 Processamento finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no processamento METRO:', error);
  }
}

if (require.main === module) {
  testarProcessamentoMetro();
}
