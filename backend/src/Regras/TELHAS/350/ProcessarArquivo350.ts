import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';
const FILIAL_CODE_3 = '0003';
const FILIAL_CODE_4 = '0004';
const FILIAL_CODE_5 = '0005';
const FILIAL_CODE_6 = '0006';

const CONTA_CC_MATRIZ = '712';

const CONTA_CORRENTE_FILIAL_MAP: Record<string, string> = {
  '7': '1000',
  '10': '2053',
  '11': '2054',
  '12': '2256',
};

const historicoMap: { [key: string]: string } = {
  APLICACAO: '444',
  RESGATE: '656',
  DEPOSITO: '466',
  TRANSFERENCIA: '609',
};

function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
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

    const filial = row[2] ? row[2].toString().trim() : '';
    if (!['5', '7', '10', '11', '12'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    const dataBaixa = row[4]
      ? row[4].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    const valorBaixa = row[6] ? parseFloat(row[6]).toFixed(2) : '0.00';
    if (parseFloat(valorBaixa) <= 0) return;

    const historicoReferencia = row[5]
      ? normalizeText(row[5].toString().trim())
      : '';
    const hist = historicoMap[historicoReferencia];
    if (!hist) {
      console.log(
        `Linha ${index + 1} ignorada - Histórico inválido: ${historicoReferencia}`,
      );
      return;
    }

    if (filial === '5') {
      const contaDebito = row[10] ? row[10].toString().trim() : '';
      const contaCredito = row[8] ? row[8].toString().trim() : '';
      output.push(
        `${MATRIZ_CODE};${dataBaixa};${contaDebito};${contaCredito};${valorBaixa};${hist}`,
      );
    } else {
      if (historicoReferencia !== 'DEPOSITO') {
        console.log(
          `Linha ${index + 1} ignorada - Apenas DEPOSITO permitido em filiais. Histórico: ${historicoReferencia}`,
        );
        return;
      }

      let localFilial = '';
      if (filial === '7') localFilial = FILIAL_CODE_3;
      else if (filial === '10') localFilial = FILIAL_CODE_4;
      else if (filial === '11') localFilial = FILIAL_CODE_5;
      else if (filial === '12') localFilial = FILIAL_CODE_6;

      output.push(
        `${localFilial};${dataBaixa};${CONTA_CC_MATRIZ};13;${valorBaixa};${hist}`,
      );

      const contaDebitoExtra = row[10] ? row[10].toString().trim() : '';
      const contaCreditoExtra = CONTA_CORRENTE_FILIAL_MAP[filial];
      output.push(
        `${MATRIZ_CODE};${dataBaixa};${contaDebitoExtra};${contaCreditoExtra};${valorBaixa};${hist}`,
      );
    }
  });

  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log('Nenhuma linha foi processada. O arquivo TXT não será gerado.');
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`📂 Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo350(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
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
