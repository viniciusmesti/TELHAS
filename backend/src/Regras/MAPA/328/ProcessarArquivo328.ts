import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// MAPA - Regra 238 (cód. relatório 328) - DEV. CRÉDITO PARA PARCEIROS
function normalizeText(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
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

export function transformarRegra238(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 328) {
      console.log(`Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`);
      return;
    }

    const empresa = row[2]?.toString().trim();
    if (!["6", "9"].includes(empresa)) {
      console.log(`Linha ${index + 1} ignorada - Empresa inválida: ${empresa}`);
      return;
    }

    const local = empresa === "6" ? "0001" : "0002";
    const banco = Number(row[22]) || null;
    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : "";
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : "";
    const historico = `2051;${historicoG} - ${historicoI}`;

    if (banco === 13) {
      output.push(`${local};${dataBaixa};893;13;${valorBaixa};${historico}`);
    } else if (banco) {
      if (empresa === "6") {
        output.push(`${local};${dataBaixa};893;${banco};${valorBaixa};${historico}`);
      } else if (empresa === "9") {
        output.push(`${local};${dataBaixa};893;1516;${valorBaixa};${historico}`);
        output.push(`0001;${dataBaixa};1513;${banco};${valorBaixa};${historico}`);
      }
    }
  });

  console.log(`Regra 238 - Total de linhas geradas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo328(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Iniciando processamento da Regra 238...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformarRegra238(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Regra 238 processada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar a Regra 238:', error);
    throw new Error('Erro no processamento da Regra 238.');
  }
}

export {};
