import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';
const FILIAL_CODE_3 = '0002';
const FILIAL_CODE_2 = '0003';
const FILIAL_CODE_4 = '0004';

const CONTA_ADIANTAMENTO_CLIENTE = '893';

const MACHINE_MAP: { [key: string]: string } = {
  getnet: '551',
  cielo: '538',
  stone: '545',
  bndes: '558',
  rede: '2060',
};

const TIPO_RELATORIO_PROCESSAR = '283';

function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Monta o campo "Histórico" com ordem variável:
 * - 1193: nome (G) depois número da nota (I)
 * - 1188: número da nota (I) depois nome (G)
 */
function buildHistorico(
  codigo: string,
  historicoG: string,
  historicoI: string,
): string {
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
  historico: string,
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
  const filial = row[2]?.toString().trim();

  if (
    tipoRelatorio !== TIPO_RELATORIO_PROCESSAR ||
    !['1', '3', '2', '4'].includes(filial)
  ) {
    console.log(
      `Linha ${index + 1} ignorada: Tipo "${tipoRelatorio}" ou filial inválida (${filial}).`,
    );
    return;
  }

  let localCode = '';
  if (filial === '1') localCode = MATRIZ_CODE;
  else if (filial === '3') localCode = FILIAL_CODE_2;
  else if (filial === '2') localCode = FILIAL_CODE_3;
  else if (filial === '4') localCode = FILIAL_CODE_4;

  const dataNegociacao = row[13]?.split(' ')[0] || ''; // Coluna M
  const valor = parseFloat(row[15] || '0').toFixed(2); // Coluna O
  const cnpjOuCpf = row[8]?.toString().trim() || ''; // Coluna H
  const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : ''; // Coluna G
  const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : ''; // Coluna I
  const machineName = row[12]?.toString().trim() || ''; // Coluna L
  const condicao = row[36]?.toString().trim() || ''; // Coluna AJ

  const machineKey = machineName.toLowerCase().includes('rede')
    ? 'rede'
    : machineName.toLowerCase();
  const machineAccount = MACHINE_MAP[machineKey] || machineName;

  let historicoCode = '';
  let creditoValue = '';

  if (condicao === '1655') {
    historicoCode = '1193';
    creditoValue = CONTA_ADIANTAMENTO_CLIENTE;
  } else {
    historicoCode = '1188';
    creditoValue = cnpjOuCpf;
  }

  const historico = buildHistorico(historicoCode, historicoI, historicoG);
  const outputLine = buildLine(
    localCode,
    dataNegociacao,
    machineAccount,
    creditoValue,
    valor,
    historico,
  );

  output.push(outputLine);
  console.log(`Linha adicionada (linha ${index + 1}): ${outputLine}`);
}

function transformData(rows: ExcelRow[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);
    processRow(row, index, output);
  });
  console.log(
    `Transformação concluída. Total de linhas processadas: ${output.length}`,
  );
  return output;
}

function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo283(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados para VENDAS EM CARTÃO - 283...');
    const transformedData = transformData(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log(
      '✅ Processo concluído com sucesso para VENDAS EM CARTÃO - 283!',
    );
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
