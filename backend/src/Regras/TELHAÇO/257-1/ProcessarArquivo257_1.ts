import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Locais (filiais)
const LOCAL_MATRIZ = '0001';
const FILIAL_MAPPING: Record<number, string> = {
  3: '0002', 
  2: '0003', 
  4: '0004', 
  503: '0002',
  502: '0003',
  504: '0004',
};

// Contas contábeis fixas
const CONTA_CHEQUES_RECEBER = '1483';
const CONTA_ADIANTAMENTO_CLIENTE = '893';
const CONTA_CC_MATRIZ = '706';
const CONTAS_FILIAIS: Record<number, string> = {
  3: '995',
  2: '994',
  4: '996',
  503: '995',
  502: '994',
  504: '996',
};

const TIPO_RELATORIO_PROCESSAR = '257/1';

function normalizeText(str: string): string {
  return str.normalize("NFD").replace(/\u0300-\u036f/g, '');
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
  const nomeCliente = row[7] ? normalizeText(row[7].toString().trim()) : '';
  const docNumero = row[9] ? normalizeText(row[9].toString().trim()) : '';
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2);
  const dataBaixa = row[14]?.split(' ')[0] || '';
  const historico = `1193;${nomeCliente}${docNumero ? ' - ' + docNumero : ''}`;

  let linhaPrincipal = '';

  if (empresa === 501) {
    linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_ADIANTAMENTO_CLIENTE};${valorBaixa};${historico}`;
  } else if ([503, 502, 504].includes(empresa)) {
    const filialCode = FILIAL_MAPPING[empresa];
    const contaFilial = CONTAS_FILIAIS[empresa];
    outputLines.push(`${filialCode};${dataBaixa};${CONTA_CC_MATRIZ};${CONTA_ADIANTAMENTO_CLIENTE};${valorBaixa};${historico}`);
    linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${contaFilial};${valorBaixa};${historico}`;
  } else if (empresa === 1) {
    linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_CHEQUES_RECEBER};${valorBaixa};1193;${nomeCliente} - ${docNumero}`;
  } else if ([3, 2, 4].includes(empresa)) {
    const filialCode = FILIAL_MAPPING[empresa];
    const contaFilial = CONTAS_FILIAIS[empresa];
    outputLines.push(`${filialCode};${dataBaixa};${CONTA_CC_MATRIZ};${CONTA_CHEQUES_RECEBER};${valorBaixa};1193;${nomeCliente} - ${docNumero}`);
    linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${contaFilial};${valorBaixa};1193;${nomeCliente} - ${docNumero}`;
  } else {
    console.log(`Empresa ${empresa} não mapeada (linha ${rowIndex + 1})`);
    return outputLines;
  }

  if (linhaPrincipal) outputLines.push(linhaPrincipal);

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

export async function processarArquivos257_1(inputExcelPath: string, outputTxtPath: string): Promise<void> {
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
