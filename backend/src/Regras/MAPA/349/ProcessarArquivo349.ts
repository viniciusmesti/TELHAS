import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '').trim();
}

export function transformarRegra349(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Linha ${index + 1} - Raw Data:`, row);

    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 349) {
      console.log(`Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`);
      return;
    }

    const filial = row[2]?.toString().trim();
    if (!["6", "9", "506"].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    const nomeCliente = row[7] ? normalizeText(row[7].toString().trim()) : "CLIENTE_DESCONHECIDO";
    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";
    if (parseFloat(valorBaixa) <= 0) {
      console.log(`Linha ${index + 1} ignorada - Valor da baixa <= 0: ${valorBaixa}`);
      return;
    }

    const banco = row[22]?.toString().trim() || '';
    const historico = `1193;${nomeCliente}`;

    if (filial === "6" || filial === "506") {
      // Lançamento dentro da Matriz
      output.push(`0001;${dataBaixa};${banco};893;${valorBaixa};${historico}`);
    } else if (filial === "9") {
      // Lançamento na Filial
      output.push(`0002;${dataBaixa};1514;893;${valorBaixa};${historico}`);

      // Lançamento Extra na Matriz
      output.push(`0001;${dataBaixa};${banco};1515;${valorBaixa};${historico}`);
    }
  });

  console.log(`Regra 349 - Total de linhas processadas: ${output.length}`);
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

export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
  console.log(`📂 Lendo arquivo: ${filePath}`);
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

export async function processarArquivo349(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento da Regra 349...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformarRegra349(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('🎉 Regra 349 processada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error.message);
    throw new Error('Erro ao processar o arquivo.');
  }
}

export {};
