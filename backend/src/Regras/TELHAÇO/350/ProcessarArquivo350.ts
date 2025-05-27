import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE   = '0001';
const FILIAL_CODE_3 = '0002';
const FILIAL_CODE_2 = '0003';
const FILIAL_CODE_4 = '0004';

const CONTA_CC_MATRIZ = '706';

const CONTA_CORRENTE_FILIAL_MAP: Record<string, string> = {
  '2': '994', // Paranavaí
  '3': '995', // Umuarama
  '4': '996', // Campo Mourão
};

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

export function processarRegra350(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 350) return;

    const filial = row[2] ? row[2].toString().trim() : "";
    if (!['1', '2', '3', '4'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    const dataBaixa = row[4] ? row[4].toString().split(" ")[0] : "DATA_INVALIDA"; // Coluna D
    const valorBaixa = row[6] ? parseFloat(row[6]).toFixed(2) : "0.00"; // Coluna F
    if (parseFloat(valorBaixa) <= 0) return;

    const historicoReferencia = row[5] ? normalizeText(row[5].toString().trim()) : ""; // Coluna E
    const hist = historicoMap[historicoReferencia];
    if (!hist) {
      console.log(`Linha ${index + 1} ignorada - Histórico inválido: ${historicoReferencia}`);
      return;
    }

    if (filial === '1') {
      // Lançamento apenas na matriz
      const contaDebito = row[10] ? row[10].toString().trim() : ""; // Coluna J
      const contaCredito = row[8] ? row[8].toString().trim() : ""; // Coluna H
      output.push(`${MATRIZ_CODE};${dataBaixa};${contaDebito};${contaCredito};${valorBaixa};${hist}`);
    } else {
      if (historicoReferencia !== 'DEPOSITO') {
        console.log(`Linha ${index + 1} ignorada - Apenas DEPÓSITO permitido em filiais. Histórico: ${historicoReferencia}`);
        return;
      }

      let localFilial = '';
      switch (filial) {
        case '2': localFilial = FILIAL_CODE_3; break; // Paranavaí = '0002'
        case '3': localFilial = FILIAL_CODE_2; break; // Umuarama = '0003'
        case '4': localFilial = FILIAL_CODE_4; break; // Campo Mourão = '0004'
      }


      // Lançamento na filial
      output.push(`${localFilial};${dataBaixa};${CONTA_CC_MATRIZ};13;${valorBaixa};${hist}`);

      // Lançamento extra na matriz
      const contaDebitoExtra = row[10] ? row[10].toString().trim() : ""; // Coluna J
      const contaCreditoExtra = CONTA_CORRENTE_FILIAL_MAP[filial];
      output.push(`${MATRIZ_CODE};${dataBaixa};${contaDebitoExtra};${contaCreditoExtra};${valorBaixa};${hist}`);
    }
  });

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
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra350(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
