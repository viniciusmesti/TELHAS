import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const COL_RELATORIO = 1;
const COL_EMPRESA = 2;
const COL_HIST_G = 7;
const COL_CNPJ_CPF = 8;
const COL_HIST_I = 9;
const COL_DATA_BAIXA = 18;
const COL_VALOR_DESDOBRAMENTO = 15;
const COL_JUROS1 = 30;
const COL_JUROS2 = 32;
const COL_DESCONTO = 29;
const COL_MULTA = 31;
const COL_TAXA_ADMIN = 33;
const COL_VALOR_COLUNA_S = 19;
const COL_BANCO_ORIGINAL = 22;
const COL_FORMA_CONTABILIZACAO = 36;

const FILIAL_LOCALS: { [key: number]: string } = {
  6: '0001',
  9: '0002',
};

const CONTAS_FILIAIS: { [key: number]: string } = {
  9: '1515',
};

const BANCO_CAIXA = '13';
const CONTA_CC_FILIAL = '1514';
const CONTA_JUROS = '1120';
const CONTA_DESCONTO = '1377';
const CONTA_MULTA = '1112';

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFloatSafe(value: any): number {
  return parseFloat(value || 0);
}

function getLocal(empresa: number): string | null {
  return FILIAL_LOCALS[empresa] || null;
}

function addIfNotZero(output: string[], line: string, valor: string): void {
  if (parseFloat(valor) !== 0) output.push(line);
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath))
    throw new Error(`Arquivo não encontrado: ${filePath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) rows.push(row.values);
  });
  return rows;
}

function processRowRegra335(
  row: any[],
  rowIndex: number,
  output: string[],
): void {
  const codigoRelatorio = Number(row[COL_RELATORIO]);
  if (codigoRelatorio !== 335) return;

  const empresa = Number(row[COL_EMPRESA]);
  const local = getLocal(empresa);
  if (!local) return;

  const bancoOriginal = row[COL_BANCO_ORIGINAL]?.toString() || '';
  const formaContabilizacao = Number(row[COL_FORMA_CONTABILIZACAO]);
  const cnpjOuCpf = row[COL_CNPJ_CPF]?.toString().trim() || '';
  const dataBaixa = row[COL_DATA_BAIXA]?.split(' ')[0] || 'DATA_INVALIDA';
  const valorDesdobramento = parseFloatSafe(
    row[COL_VALOR_DESDOBRAMENTO],
  ).toFixed(2);
  const jurosRecebidos = (
    parseFloatSafe(row[COL_JUROS1]) + parseFloatSafe(row[COL_JUROS2])
  ).toFixed(2);
  const desconto = parseFloatSafe(row[COL_DESCONTO]).toFixed(2);
  const multa = parseFloatSafe(row[COL_MULTA]).toFixed(2);
  const taxaAdministradora = parseFloatSafe(row[COL_TAXA_ADMIN]).toFixed(2);
  const valorColunaS = parseFloatSafe(row[COL_VALOR_COLUNA_S]).toFixed(2);

  const historicoG = normalizeText(row[COL_HIST_G]?.toString() || '');
  const historicoI = normalizeText(row[COL_HIST_I]?.toString() || '');
  const historicoBase = `${historicoG} - ${historicoI}`;

  const isCaixa = bancoOriginal === BANCO_CAIXA;
  const isAdiantamento = formaContabilizacao === 1655;
  const isFilial = [9].includes(empresa);
  const isMatriz = empresa === 6;

  const debito = isCaixa
    ? BANCO_CAIXA
    : isFilial
      ? CONTA_CC_FILIAL
      : bancoOriginal;

  const credito = isAdiantamento ? '893' : cnpjOuCpf;

  addIfNotZero(
    output,
    `${local};${dataBaixa};${debito};${credito};${valorDesdobramento};1200;${historicoBase}`,
    valorDesdobramento,
  );
  addIfNotZero(
    output,
    `${local};${dataBaixa};${debito};${CONTA_JUROS};${jurosRecebidos};1202;${historicoBase}`,
    jurosRecebidos,
  );
  addIfNotZero(
    output,
    `${local};${dataBaixa};${CONTA_DESCONTO};${debito};${desconto};2082;${historicoBase}`,
    desconto,
  );
  addIfNotZero(
    output,
    `${local};${dataBaixa};${debito};${CONTA_MULTA};${multa};1997;${historicoBase}`,
    multa,
  );
  addIfNotZero(
    output,
    `${local};${dataBaixa};${CONTA_DESCONTO};${debito};${taxaAdministradora};2082;${historicoBase}`,
    taxaAdministradora,
  );

  if (!isCaixa && isFilial) {
    const contaFilial = CONTAS_FILIAIS[empresa];
    addIfNotZero(
      output,
      `0001;${dataBaixa};${bancoOriginal};${contaFilial};${valorColunaS};1200;${historicoBase}`,
      valorColunaS,
    );
  }

  if (!isAdiantamento && !isCaixa && isFilial) {
    const contaFilial = CONTAS_FILIAIS[empresa];
    addIfNotZero(
      output,
      `0001;${dataBaixa};${cnpjOuCpf};${contaFilial};${valorColunaS};1200;${historicoBase}`,
      valorColunaS,
    );
  }
}

export function processarRegra335(rows: any[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => {
    processRowRegra335(row, index, output);
  });
  console.log(`Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log('Nenhuma linha foi processada. O arquivo TXT não será gerado.');
    return;
  }
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo335(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra335(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
