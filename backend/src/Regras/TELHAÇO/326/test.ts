import { Processador326 } from './ProcessarArquivo326';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  const baseDir = 'C:\\Users\\Administrador\\Desktop\\DEPLOY\\backend\\src\\uploads\\TELHAÇO';

  const inputExcelPath = path.join(baseDir, 'uploads', '326.xlsx');
  const duplicatasPath = path.join(baseDir, 'uploads', 'DUPLICATAS EM ABERTO.xlsx');

  const outputContabilPath = path.join(baseDir, 'saida', 'contabil', 'contabil326.txt');
  const outputFiscalPath = path.join(baseDir, 'saida', 'fiscal', 'fiscal326.txt');
  const outputDuplicatasPath = path.join(baseDir, 'saida', 'duplicatas', 'duplicatas_nao_encontradas326.xlsx');

  console.log("Verificando existência dos arquivos:");
  console.log("Input Excel:", fs.existsSync(inputExcelPath));
  console.log("Duplicatas Excel:", fs.existsSync(duplicatasPath));

  [path.dirname(outputContabilPath), path.dirname(outputFiscalPath), path.dirname(outputDuplicatasPath)]
    .forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

  try {
    console.log('⏳ Iniciando processamento da Regra 326...');
    await Processador326.processarArquivo326(
      inputExcelPath,
      duplicatasPath,
      outputContabilPath,
      outputFiscalPath,
      outputDuplicatasPath
    );
  } catch (error) {
    console.error('❌ Erro durante o processamento:', error);
  }
}

main().catch(err => console.error('Erro geral:', err));
