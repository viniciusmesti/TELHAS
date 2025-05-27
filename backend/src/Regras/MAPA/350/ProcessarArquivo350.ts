import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const historicoMap: { [key: string]: string } = {
  "APLICACAO": "444",
  "RESGATE": "656",
  "DEPOSITO": "466",
  "TRANSFERENCIA": "609"
};

function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
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

export function transformarRegra350(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 350) return;

    const filial = row[2]?.toString().trim();
    if (!["6", "9"].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    const dataBaixa = row[4] ? row[4].toString().split(" ")[0] : "DATA_INVALIDA";
    const valorBaixa = row[6] ? parseFloat(row[6]).toFixed(2) : "0.00";
    if (parseFloat(valorBaixa) <= 0) return;

    const tipoMovimentacao = normalizeText(row[5]);
    const hist = historicoMap[tipoMovimentacao];
    if (!hist) {
      console.log(`Linha ${index + 1} ignorada - Histórico inválido: ${tipoMovimentacao}`);
      return;
    }

    const contaDebito = row[10]?.toString().trim() || '';
    const contaCredito = row[8]?.toString().trim() || '';

    if (filial === "6") {
      // MATRIZ
      output.push(`0001;${dataBaixa};${contaDebito};${contaCredito};${valorBaixa};${hist}`);
    } else if (filial === "9") {
      if (tipoMovimentacao !== "DEPOSITO") {
        console.log(`Linha ${index + 1} ignorada - Filial só aceita depósito. Tipo: ${tipoMovimentacao}`);
        return;
      }

      const localFilial = "0002";
      const contaFilial = "1515";

      // Dentro da filial
      output.push(`${localFilial};${dataBaixa};1514;13;${valorBaixa};${hist}`);

      // Extra na matriz
      output.push(`0001;${dataBaixa};${contaDebito};${contaFilial};${valorBaixa};${hist}`);
    }
  });

  console.log(`Regra 350 - Total de linhas processadas: ${output.length}`);
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
  console.log(`📂 Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo350(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento da Regra 350...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformarRegra350(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('✅ Regra 350 processada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar a Regra 350:', error);
    throw new Error('Erro ao processar a Regra 350.');
  }
}

export {};
