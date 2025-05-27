import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

function normalizeText(str: any): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  console.log(`📂 Lendo arquivo: ${filePath}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    console.error('❌ Nenhuma planilha encontrada no arquivo.');
    throw new Error('Nenhuma planilha encontrada no arquivo.');
  }

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  console.log(`✅ Total de linhas lidas: ${rows.length}`);
  return rows;
}

// Processamento da Regra 347 para N&P – REAPRESENTAÇÃO CHD
export function processarRegra347(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 347) return;

    const codLocal = row[2] ? row[2].toString().trim() : '';

    let grupo = 0;
    if (['6', '9'].includes(codLocal)) {
      grupo = 1;
    } else if (['506', '509'].includes(codLocal)) {
      grupo = 2;
    } else {
      return;
    }

    // Mapeamento do local (primeiro campo da saída)
    let local = '';
    if (grupo === 1) {
      if (codLocal === '6') local = '0001';
      else if (codLocal === '9') local = '0002';
    } else if (grupo === 2) {
      if (codLocal === '506') local = '0001';
      else if (codLocal === '509') local = '0002';
    }

    const banco = row[22] ? row[22].toString().trim() : '';
    const dataBaixa = row[18]
      ? row[18].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    const valor = row[19] ? parseFloat(row[19]).toFixed(2) : '0.00';
    if (parseFloat(valor) <= 0) return;

    const historicoG = row[7] ? normalizeText(row[7].toString()) : 'HIST_G';
    const historicoI = row[9] ? normalizeText(row[9].toString()) : 'HIST_I';
    const historicoAH = row[34] ? normalizeText(row[34].toString()) : 'HIST_AH';
    const historicoBase = `3007;${historicoG} - ${historicoI}/${historicoAH}`;

    if (grupo === 1) {
      if (codLocal === '6') {
        output.push(
          `${local};${dataBaixa};${banco};1483;${valor};${historicoBase}`,
        );
      } else if (codLocal === '9') {
        output.push(
          `${local};${dataBaixa};1514;1483;${valor};${historicoBase}`,
        );

        let extraAccount = '';
        if (codLocal === '9') extraAccount = '1515';
        output.push(
          `0001;${dataBaixa};${banco};${extraAccount};${valor};${historicoBase}`,
        );
      }

      if (codLocal === '506') {
        output.push(
          `${local};${dataBaixa};${banco};893;${valor};${historicoBase}`,
        );
      } else if (codLocal === '509') {
        output.push(`${local};${dataBaixa};1514;893;${valor};${historicoBase}`);

        let extraAccount = '';
        if (codLocal === '509') extraAccount = '1515';
        output.push(
          `0001;${dataBaixa};${banco};${extraAccount};${valor};${historicoBase}`,
        );
      }
    }
  });

  console.log(`✅ Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log(
      '❌ Nenhuma linha foi processada. Arquivo TXT não será gerado.',
    );
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`✅ Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo347(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra347(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error.message);
    throw new Error('Erro ao processar o arquivo.');
  }
}
