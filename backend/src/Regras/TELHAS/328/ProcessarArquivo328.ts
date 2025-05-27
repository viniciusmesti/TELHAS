import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE   = '0001';
const FILIAL_CODE_3 = '0003';
const FILIAL_CODE_4 = '0004';
const FILIAL_CODE_5 = '0005';
const FILIAL_CODE_6 = '0006';

function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, '');
} 

export async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  return rows;
}

export function processarRegra328(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Linha ${index + 1} - Raw Data:`, row);

    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 328) {
      console.log(`Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`);
      return;
    }

    const filial = row[2] ? row[2].toString().trim() : '';
    if (!['5', '7', '10', '11', '12'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Empresa/Filial inválida: ${filial}`);
      return;
    }

    const local = filial === '5' ? MATRIZ_CODE :
                  filial === '7' ? FILIAL_CODE_3 :
                  filial === '10' ? FILIAL_CODE_4 :
                  filial === '11' ? FILIAL_CODE_5 :
                  filial === '12' ? FILIAL_CODE_6 :
                  '';

    const banco = Number(row[22]) || null;
    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : "HIST_G";
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : "HIST_I";
    const historicoBase = `2051;${historicoG} - ${historicoI}`;

    // CASO CAIXA (banco == 13)
    if (banco === 13) {
      output.push(`${local};${dataBaixa};893;13;${valorBaixa};${historicoBase}`);
    } else if (banco) {
      // CASO BANCO
      if (filial === '5') {
        // MATRIZ
        output.push(`${local};${dataBaixa};893;${banco};${valorBaixa};${historicoBase}`);
      } else {
        // FILIAIS – lançamento na própria filial + extra na matriz
        output.push(`${local};${dataBaixa};893;999;${valorBaixa};${historicoBase}`);

        const contaExtra = filial === '7' ? '713' :
                           filial === '10' ? '2047' :
                           filial === '11' ? '2048' :
                           filial === '12' ? '2255' :
                           '';

        output.push(`0001;${dataBaixa};${contaExtra};${banco};${valorBaixa};${historicoBase}`);
      }
    }
  });

  console.log(`Total de linhas processadas: ${output.length}`);
  return output;
}


export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo328(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra328(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}

export {};