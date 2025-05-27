import { processarArquivo289NP, exportToTxt289 } from './ProcessarArquivo289';
import * as path from 'path';
import * as fs from 'fs';
import * as xlsx from 'xlsx';

async function testarProcessamento() {
  try {
    console.log('Iniciando o teste da regra NP 289...');

    // Define a pasta base onde estão os arquivos de entrada e saída
    const baseDir = path.join(__dirname, '..', '..', '..', 'uploads', 'N&P');

    // Caminhos de entrada
    const inputDuplicatasPath = path.join(
      baseDir,
      'uploads',
      'DUPLICATAS EM ABERTO.xlsx',
    );
    const inputPagamentosPath = path.join(baseDir, 'uploads', '289.xlsx');

    // Caminhos de saída
    const outputContabilPath = path.join(
      baseDir,
      'saida',
      'contabil',
      'contabil289_np.txt',
    );
    const outputFiscalPath = path.join(
      baseDir,
      'saida',
      'fiscal',
      'fiscal289_np.txt',
    );
    const outputDuplicatasPath = path.join(
      baseDir,
      'saida',
      'duplicatas',
      'duplicatas_nao_encontradas289_np.xlsx',
    );

    // Cria os diretórios de saída, se não existirem
    [
      path.dirname(outputContabilPath),
      path.dirname(outputFiscalPath),
      path.dirname(outputDuplicatasPath),
    ].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Executa o processamento
    const { contabil, fiscal, duplicatas } = await processarArquivo289NP(
      inputPagamentosPath,
      inputDuplicatasPath,
    );

    // Exporta os arquivos TXT
    exportToTxt289(contabil, outputContabilPath);
    exportToTxt289(fiscal, outputFiscalPath);

    // Exporta duplicatas não encontradas para Excel, se houver
    if (duplicatas.length > 0) {
      const workbookOut = xlsx.utils.book_new();
      const worksheetOut = xlsx.utils.json_to_sheet(duplicatas);
      xlsx.utils.book_append_sheet(workbookOut, worksheetOut, 'Duplicatas');
      xlsx.writeFile(workbookOut, outputDuplicatasPath);
      console.log(
        `📊 Arquivo de duplicatas não encontradas gerado com ${duplicatas.length} registros.`,
      );
    } else {
      console.log('✅ Nenhuma duplicata para reportar.');
    }

    console.log('Teste da regra NP 289 concluído com sucesso!');
    console.log('Arquivos gerados:');
    console.log(` - Contábil: ${outputContabilPath}`);
    console.log(` - Fiscal: ${outputFiscalPath}`);
    console.log(` - Duplicatas: ${outputDuplicatasPath}`);
  } catch (error) {
    console.error('Erro durante o teste da regra NP 289:', error);
  }
}

testarProcessamento();
