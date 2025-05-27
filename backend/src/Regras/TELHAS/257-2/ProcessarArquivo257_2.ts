import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const LOCAL_MATRIZ = '0001';
const FILIAL_MAPPING: Record<number, string> = {
  7: '0003',
  10: '0004',
  11: '0005',
  12: '0006',
  507: '0003',
  510: '0004',
  511: '0005',
  512: '0006',
};

const CONTA_CHEQUES_RECEBER = '1483';
const CONTA_ADIANTAMENTO_CLIENTE = '893';
const CONTA_CC_MATRIZ = '712';
const CONTAS_FILIAIS: Record<number, string> = {
  7: '1000',
  10: '2053',
  11: '2054',
  12: '2256',
  507: '1000',
  510: '2053',
  511: '2054',
  512: '2256',
};

const TIPO_RELATORIO_PROCESSAR = '257/2';

function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildHistoricoAdiant(nomeCliente: string): string {
  return `1193;${nomeCliente}`;
}

function buildHistoricoCheq(nomeCliente: string, docNumero: string): string {
  return `1193;${nomeCliente}${docNumero ? ' - ' + docNumero : ''}`;
}

function buildLine(
  local: string,
  data: string,
  contaDeb: string,
  contaCred: string,
  valor: string,
  historico: string,
): string {
  return `${local};${data};${contaDeb};${contaCred};${valor};${historico}`;
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) rows.push(row.values);
  });

  return rows;
}

function processRow(row: any[], rowIndex: number): string[] {
  const outputLines: string[] = [];

  const tipoRelatorio = row[1]?.toString().trim();
  if (tipoRelatorio !== TIPO_RELATORIO_PROCESSAR) return outputLines;

  const empresa = parseInt(row[2]);
  const banco = row[22]?.toString() || '';
  const dataBaixa = row[14]?.split(' ')[0] || '';
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2);
  const nomeCliente = row[7] ? normalizeText(row[7].toString().trim()) : '';
  const docNumero = row[9] ? normalizeText(row[9].toString().trim()) : '';

  const historicoAdiant = buildHistoricoAdiant(nomeCliente);
  const historicoCheq = buildHistoricoCheq(nomeCliente, docNumero);

  if (empresa === 505) {
    outputLines.push(
      buildLine(
        LOCAL_MATRIZ,
        dataBaixa,
        banco,
        CONTA_ADIANTAMENTO_CLIENTE,
        valorBaixa,
        historicoAdiant,
      ),
    );
  } else if ([507, 510, 511, 512].includes(empresa)) {
    const filialCode = FILIAL_MAPPING[empresa];
    const contaFilial = CONTAS_FILIAIS[empresa];
    outputLines.push(
      buildLine(
        filialCode,
        dataBaixa,
        CONTA_CC_MATRIZ,
        CONTA_ADIANTAMENTO_CLIENTE,
        valorBaixa,
        historicoAdiant,
      ),
    );
    outputLines.push(
      buildLine(
        LOCAL_MATRIZ,
        dataBaixa,
        banco,
        contaFilial,
        valorBaixa,
        historicoAdiant,
      ),
    );
  } else if (empresa === 5) {
    outputLines.push(
      buildLine(
        LOCAL_MATRIZ,
        dataBaixa,
        banco,
        CONTA_CHEQUES_RECEBER,
        valorBaixa,
        historicoCheq,
      ),
    );
  } else if ([7, 10, 11, 12].includes(empresa)) {
    const filialCode = FILIAL_MAPPING[empresa];
    const contaFilial = CONTAS_FILIAIS[empresa];
    outputLines.push(
      buildLine(
        filialCode,
        dataBaixa,
        CONTA_CC_MATRIZ,
        CONTA_CHEQUES_RECEBER,
        valorBaixa,
        historicoCheq,
      ),
    );
    outputLines.push(
      buildLine(
        LOCAL_MATRIZ,
        dataBaixa,
        banco,
        contaFilial,
        valorBaixa,
        historicoCheq,
      ),
    );
  } else {
    console.log(`Empresa ${empresa} não reconhecida (linha ${rowIndex + 1})`);
  }

  return outputLines;
}

export function transformData(rows: any[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => {
    const linhas = processRow(row, index);
    output.push(...linhas);
  });
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo257_2(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformData(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
