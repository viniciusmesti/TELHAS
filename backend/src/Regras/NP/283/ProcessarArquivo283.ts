import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE    = '0001';
const FILIAL_CODE_2  = '0002';
const FILIAL_CODE_3  = '0003';

const CONTA_ADIANTAMENTO_CLIENTE = '893';

const MACHINE_MAP: { [key: string]: string } = {
  'getnet': '551',
  'cielo':  '538',
  'stone':  '545',
  'bndes':  '558',
  'rede':   '2060'
};

const TIPO_RELATORIO_PROCESSAR = '283';

function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Monta o campo "Histórico" com ordem variável:
 * - 1193: nome (G) depois número da nota (I)
 * - 1188: número da nota (I) depois nome (G)
 */
function buildHistorico(codigo: string, historicoG: string, historicoI: string): string {
  if (codigo === '1193') {
    // Adiantamento → nome – número da nota
    return `${codigo};${historicoI} - ${historicoG}`;
  } else {
    // Outros (1188) → número da nota – nome
    return `${codigo};${historicoG} - ${historicoI}`;
  }
}

function buildLine(
  local: string,
  data: string,
  debito: string,
  credito: string,
  valor: string,
  historico: string
): string {
  return `${local};${data};${debito};${credito};${valor};${historico}`;
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
    if (rowNumber > 1) {
      rows.push(row.values as ExcelRow);
    }
  });

  return rows;
}

function processRow(row: ExcelRow, index: number, output: string[]): void {
  const tipoRelatorio = row[1]?.toString().trim();
  const filial        = row[2]?.toString().trim();

  if (
    tipoRelatorio !== TIPO_RELATORIO_PROCESSAR ||
    !['13', '14', '15'].includes(filial)
  ) {
    console.log(`Linha ${index + 1} ignorada.`);
    return;
  }

  // mapeia filial para código
  let localCode = '';
  if (filial === '13')      localCode = MATRIZ_CODE;
  else if (filial === '14') localCode = FILIAL_CODE_2;
  else                      localCode = FILIAL_CODE_3;

  // extrai campos
  const dataNegociacao = row[13]?.toString().split(' ')[0] ?? '';
  const valor          = parseFloat(row[15]  || '0').toFixed(2);
  const cnpjOuCpf      = row[8]?.toString()   ?? '';
  const historicoG     = row[7]  ? normalizeText(row[7].toString()) : '';
  const historicoI     = row[9]  ? normalizeText(row[9].toString()) : '';
  const machineName    = row[12]?.toString().trim().toLowerCase() ?? '';
  const machineKey     = machineName.includes('rede')
    ? 'rede'
    : machineName;
  const machineAccount = MACHINE_MAP[machineKey] || machineName;
  const condicao       = row[36]?.toString().trim() ?? '';

  // decide código do histórico e crédito
  let historicoCode = '';
  let creditoValue  = '';
  if (condicao === '1655') {
    historicoCode = '1193';
    creditoValue  = CONTA_ADIANTAMENTO_CLIENTE;
  } else {
    historicoCode = '1188';
    creditoValue  = cnpjOuCpf;
  }

  // monta o histórico com a ordem correta
  const historico    = buildHistorico(historicoCode, historicoG, historicoI);
  const outputLine  = buildLine(
    localCode,
    dataNegociacao,
    machineAccount,
    creditoValue,
    valor,
    historico
  );

  output.push(outputLine);
  console.log(`Linha adicionada (${index + 1}): ${outputLine}`);
}

function transformData(rows: ExcelRow[]): string[] {
  const output: string[] = [];
  rows.forEach((row, i) => processRow(row, i, output));
  console.log(`Transformação concluída: ${output.length} linhas.`);
  return output;
}

function exportToTxt(data: string[], outputPath: string): void {
  data.push(''); // linha em branco final
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo283(
  inputExcelPath: string,
  outputTxtPath: string
): Promise<void> {
  try {
    console.log('Lendo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas: ${rows.length}`);

    console.log('Processando Regra 283...');
    const transformed = transformData(rows);

    console.log('Gerando TXT...');
    exportToTxt(transformed, outputTxtPath);

    console.log('✅ Processo concluído para VENDAS EM CARTÃO - 283!');
  } catch (err) {
    console.error('❌ Erro:', err);
    throw err;
  }
}
