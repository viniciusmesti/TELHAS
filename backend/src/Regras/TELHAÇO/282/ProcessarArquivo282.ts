import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';
const FILIAL_CODE_3 = '0002';
const FILIAL_CODE_2 = '0003';
const FILIAL_CODE_4 = '0004';
const CC_MATRIZ = '706';

const CONTA_JUROS_RECEBIDOS = '1120';
const CONTA_DESCONTO = '1377';
const CONTA_MULTA = '1112';

const CONTA_FILIAL_MAP: Record<string, string> = {
  '3': '995',
  '2': '994',
  '4': '996',
};

const FILIAL_LOCAL_MAP: Record<string, string> = {
  '2': FILIAL_CODE_3,
  '3': FILIAL_CODE_2,
  '4': FILIAL_CODE_4,
};

const TIPO_RELATORIO_PROCESSAR = '282';

function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/\u0300-\u036f/g, '');
}

function buildHistorico(
  codigo: string,
  historicoI: string,
  historicoG: string,
  isJurosOuMulta: boolean,
  numeroNota: string,
): string {
  return isJurosOuMulta
    ? `${codigo};${historicoG} - ${numeroNota}`
    : `${codigo};${numeroNota} - ${historicoG}`;
}

function buildLine(
  local: string,
  dataCredito: string,
  campo: string,
  conta: string,
  valor: string,
  historico: string,
): string {
  return `${local};${dataCredito};${campo};${conta};${valor};${historico}`;
}

interface ExcelRow {
  [key: number]: any;
}

async function readExcelFile(filePath: string): Promise<ExcelRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: ExcelRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) rows.push(row.values as ExcelRow);
  });
  return rows;
}

function processRow(row: ExcelRow, index: number, output: string[]): void {
  const tipoRelatorio = row[1]?.toString().trim();
  const filial = row[2]?.toString().trim();

  if (tipoRelatorio !== TIPO_RELATORIO_PROCESSAR || !/^[0-9]+$/.test(filial)) {
    console.log(`Linha ${index + 1} ignorada.`);
    return;
  }

  const dataCredito = row[18]?.split(' ')[0] || '';
  const valorDesdobramento = parseFloat(row[15] || '0').toFixed(2);
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2);
  const valorDesconto = parseFloat(row[29] || '0').toFixed(2);
  const valorJuros = (
    parseFloat(row[30] || '0') + parseFloat(row[32] || '0')
  ).toFixed(2);
  const valorMulta = parseFloat(row[31] || '0').toFixed(2);

  const cnpjOuCpf = row[8]?.toString() || '';
  const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : '';
  const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : '';
  const banco = row[22]?.toString() || '';
  const numeroNota = historicoI;

  const addLine = (
    debito: string,
    credito: string,
    valor: string,
    historicoCodigo: string,
    local: string,
    isJurosOuMulta: boolean = false,
  ) => {
    if (parseFloat(valor) > 0) {
      output.push(
        buildLine(
          local,
          dataCredito,
          debito,
          credito,
          valor,
          buildHistorico(
            historicoCodigo,
            historicoI,
            historicoG,
            isJurosOuMulta,
            numeroNota,
          ),
        ),
      );
    }
  };

  if (filial === '1') {
    addLine(banco, cnpjOuCpf, valorDesdobramento, '1188', MATRIZ_CODE);
    addLine(
      banco,
      CONTA_JUROS_RECEBIDOS,
      valorJuros,
      '1202',
      MATRIZ_CODE,
      true,
    );
    addLine(CONTA_DESCONTO, banco, valorDesconto, '2082', MATRIZ_CODE);
    addLine(banco, CONTA_MULTA, valorMulta, '1997', MATRIZ_CODE);
  } else if (['2', '3', '4'].includes(filial)) {
    const localFilial = FILIAL_LOCAL_MAP[filial];
    const contaFilial = CONTA_FILIAL_MAP[filial];

    addLine(CC_MATRIZ, cnpjOuCpf, valorDesdobramento, '1188', localFilial);
    addLine(
      CC_MATRIZ,
      CONTA_JUROS_RECEBIDOS,
      valorJuros,
      '1202',
      localFilial,
      true,
    );
    addLine(CONTA_DESCONTO, CC_MATRIZ, valorDesconto, '2082', localFilial);
    addLine(CC_MATRIZ, CONTA_MULTA, valorMulta, '1997', localFilial);

    addLine(banco, contaFilial, valorBaixa, '1188', MATRIZ_CODE);
  } else {
    console.log(`Linha ${index + 1} ignorada: Filial não mapeada (${filial})`);
  }
}

function transformData(rows: ExcelRow[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => {
    processRow(row, index, output);
  });
  return output;
}

function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo282(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformData(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('✅ Arquivo 282 processado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
