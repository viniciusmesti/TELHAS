import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Constantes da regra
const MATRIZ_CODE   = '0001';
const FILIAL_CODE_2 = '0002';
const CONTA_FILIAL_EXTRA = '1515';
const CONTA_JUROS_RECEBIDOS = '1120';
const CONTA_DESCONTO = '1377';
const CONTA_MULTA = '1112';
const CONTA_C_C_MATRIZ = '1514';
const TIPO_RELATORIO_PROCESSAR = '282';

// Utilitários
function normalizeText(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
}

function buildHistorico(codigo: string, doc: string, cliente: string): string {
  return `${codigo};${doc} - ${cliente}`;
}

function buildLine(local: string, data: string, debito: string, credito: string, valor: string, historico: string): string {
  return `${local};${data};${debito};${credito};${valor};${historico}`;
}

async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) rows.push(row.values);
  });

  return rows;
}

// Processamento principal por linha
function processRow(row: any[], index: number, output: string[]): void {
  const tipoRelatorio = row[1]?.toString().trim();
  const empresa = row[2]?.toString().trim();
  if (tipoRelatorio !== TIPO_RELATORIO_PROCESSAR || !['6', '9'].includes(empresa)) return;

  const local = empresa === '6' ? MATRIZ_CODE : FILIAL_CODE_2;
  const data = row[18]?.split(' ')[0] || '';
  const banco = row[22]?.toString() || '';
  const cnpj = row[8]?.toString() || '';
  const cliente = normalizeText(row[7]?.toString() || '');
  const numeroDoc = normalizeText(row[9]?.toString() || '');

  const valorDesdobramento = parseFloat(row[15] || '0').toFixed(2); // O
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2); // S
  const juros = (parseFloat(row[30] || '0') + parseFloat(row[32] || '0')).toFixed(2); // AD + AF
  const desconto = parseFloat(row[29] || '0').toFixed(2); // AC
  const multa = parseFloat(row[31] || '0').toFixed(2); // AE

  // Histórico base
  const histDoc = numeroDoc;
  const histCliente = cliente;

  const add = (loc: string, deb: string, cred: string, val: string, hist: string) => {
    if (parseFloat(val) > 0) {
      output.push(buildLine(loc, data, deb, cred, val, hist));
    }
  };

  if (empresa === '6') {
    // Lançamentos dentro da matriz
    add(MATRIZ_CODE, banco, cnpj, valorDesdobramento, buildHistorico('1188', histDoc, histCliente));
    add(MATRIZ_CODE, banco, CONTA_JUROS_RECEBIDOS, juros, buildHistorico('1202', histDoc, histCliente));
    add(MATRIZ_CODE, CONTA_DESCONTO, banco, desconto, buildHistorico('2082', histDoc, histCliente));
    add(MATRIZ_CODE, banco, CONTA_MULTA, multa, buildHistorico('1997', histDoc, histCliente));
  }

  if (empresa === '9') {
    // Dentro da filial
    add(FILIAL_CODE_2, CONTA_C_C_MATRIZ, cnpj, valorDesdobramento, buildHistorico('1188', histDoc, histCliente));
    add(FILIAL_CODE_2, CONTA_C_C_MATRIZ, CONTA_JUROS_RECEBIDOS, juros, buildHistorico('1202', histDoc, histCliente));
    add(FILIAL_CODE_2, CONTA_DESCONTO, CONTA_C_C_MATRIZ, desconto, buildHistorico('2082', histDoc, histCliente));
    add(FILIAL_CODE_2, CONTA_C_C_MATRIZ, CONTA_MULTA, multa, buildHistorico('1997', histDoc, histCliente));

    // Extra na matriz
    add(MATRIZ_CODE, banco, CONTA_FILIAL_EXTRA, valorBaixa, buildHistorico('1188', histDoc, histCliente));
  }
}

function transformData(rows: any[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => processRow(row, index, output));
  console.log(`Transformação concluída. Total de linhas: ${output.length}`);
  return output;
}

function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo282(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    const rows = await readExcelFile(inputExcelPath);
    const data = transformData(rows);
    exportToTxt(data, outputTxtPath);
    console.log('✅ Regra 282 processada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
