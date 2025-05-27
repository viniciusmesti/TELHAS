import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  
  console.log("Planilhas disponíveis:", workbook.worksheets.map(sheet => sheet.name));
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  console.log(`Total de linhas lidas: ${rows.length}`);
  return rows;
}

export function transformarRegra336(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 336) return;

    const filial = row[2]?.toString().trim();
    if (!["6", "9"].includes(filial)) return;

    const local = filial === "6" ? "0001" : "0002";
    const cnpjCliente = row[8] ? normalizeText(row[8].toString()) : "CNPJ_CLIENTE";
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : "HIST_G";
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : "HIST_I";
    const historicoBase = `${historicoI} - ${historicoG}`;

    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";

    const valorDesdobramento = parseFloat(row[15] || 0).toFixed(2);
    const jurosRecebidos = (parseFloat(row[30] || 0) + parseFloat(row[32] || 0)).toFixed(2);
    const desconto = parseFloat(row[29] || 0).toFixed(2);
    const multa = parseFloat(row[31] || 0).toFixed(2);

    if (parseFloat(valorDesdobramento) > 0) {
      output.push(`${local};${dataBaixa};893;${cnpjCliente};${valorDesdobramento};2081;${historicoBase}`);
    }
    if (parseFloat(jurosRecebidos) > 0) {
      output.push(`${local};${dataBaixa};893;1120;${jurosRecebidos};1202;${historicoBase}`);
    }
    if (parseFloat(desconto) > 0) {
      output.push(`${local};${dataBaixa};1377;893;${desconto};2082;${historicoBase}`);
    }
    if (parseFloat(multa) > 0) {
      output.push(`${local};${dataBaixa};893;1112;${multa};1997;${historicoBase}`);
    }
  });

  console.log(`Regra 336 - Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log("Nenhuma linha foi processada. O arquivo TXT não será gerado.");
    return;
  }

  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo336(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Iniciando processamento da Regra 336...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformarRegra336(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Regra 336 processada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar a Regra 336:', error);
    throw new Error('Erro ao processar a Regra 336.');
  }
}

export {};
