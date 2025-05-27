import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Índices das colunas (baseado na posição no array row.values)
const COL_RELATORIO           = 1;
const COL_EMPRESA             = 2;
const COL_HIST_G              = 7;
const COL_CNPJ_CPF            = 8;
const COL_HIST_I              = 9;
const COL_DATA_BAIXA          = 18;
const COL_VALOR_DESDOBRAMENTO = 15;
const COL_JUROS1              = 30;
const COL_JUROS2              = 32;
const COL_DESCONTO            = 29;
const COL_MULTA               = 31;
const COL_TAXA_ADMIN          = 33;
const COL_VALOR_COLUNA_S      = 19;
const COL_BANCO_ORIGINAL      = 22;
const COL_FORMA_CONTABILIZACAO= 36;

// Mapeamento de locais conforme o código da empresa
const FILIAL_LOCALS: { [key: number]: string } = {
  5: '0001',
  7: '0003',
  10: '0004',
  11: '0005',
  12: '0006',
};

// Contas específicas para determinadas filiais 
const CONTAS_FILIAIS: { [key: number]: string } = {
  7: '1000',
  10: '2053',
  11: '2054',
  12: '2256',
};

// Outras constantes
const BANCO_CAIXA            = '13';
const CONTA_PADRAO_FILIAL    = '1514';
const CONTA_CC_MATRIZ        = '712';

function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
}

function parseFloatSafe(value: any): number {
  return parseFloat(value || 0);
}

function getLocal(empresa: number): string | null {
  return FILIAL_LOCALS[empresa] || null;
}

function getBancoDebito(bancoOriginal: string | null, empresa: number): string {
  return bancoOriginal || '';
}

function addIfNotZero(output: string[], line: string, valor: string): void {
  if (parseFloat(valor) !== 0) {
    output.push(line);
  }
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  return rows;
}

function processRowRegra335(row: any[], rowIndex: number, output: string[]): void {
  console.log(`Linha ${rowIndex + 1} - Raw Data:`, row);

  const codigoRelatorio = Number(row[COL_RELATORIO]);
  if (codigoRelatorio !== 335) return;

  const empresa = Number(row[COL_EMPRESA]);
  const local = getLocal(empresa);
  if (!local) return;

  const bancoOriginal = row[COL_BANCO_ORIGINAL]?.toString() || '';
  const formaContabilizacao = Number(row[COL_FORMA_CONTABILIZACAO]);
  const cnpjOuCpf = row[COL_CNPJ_CPF]?.toString().trim() || '';
  const dataBaixa = row[COL_DATA_BAIXA] ? row[COL_DATA_BAIXA].split(" ")[0] : "DATA_INVALIDA";
  const valorDesdobramento = parseFloatSafe(row[COL_VALOR_DESDOBRAMENTO]).toFixed(2);
  const jurosRecebidos = (parseFloatSafe(row[COL_JUROS1]) + parseFloatSafe(row[COL_JUROS2])).toFixed(2);
  const desconto = parseFloatSafe(row[COL_DESCONTO]).toFixed(2);
  const multa = parseFloatSafe(row[COL_MULTA]).toFixed(2);
  const taxaAdministradora = parseFloatSafe(row[COL_TAXA_ADMIN]).toFixed(2);
  const valorColunaS = parseFloatSafe(row[COL_VALOR_COLUNA_S]).toFixed(2);

  const historicoG = normalizeText(row[COL_HIST_G]?.toString().trim() || '');
  const historicoI = normalizeText(row[COL_HIST_I]?.toString().trim() || '');
  const historicoBase = `${historicoG} - ${historicoI}`;

  const isFilial = [7, 10, 11, 12].includes(empresa);
  const extraRecordNeeded = isFilial && bancoOriginal !== '13';

// débito: se for caixa (V = 13) → 13; 
// senão, se for filial 7/10/11/12 → conta-corrente 712;
// senão (matriz) → bancoOriginal
const debitoPadrao = bancoOriginal === BANCO_CAIXA
  ? BANCO_CAIXA
  : isFilial
    ? CONTA_CC_MATRIZ
    : bancoOriginal;


  const creditoPadrao = formaContabilizacao === 1655 ? '893' : cnpjOuCpf;

  addIfNotZero(output, `${local};${dataBaixa};${debitoPadrao};${creditoPadrao};${valorDesdobramento};1200;${historicoBase}`, valorDesdobramento);
  addIfNotZero(output, `${local};${dataBaixa};${debitoPadrao};1120;${jurosRecebidos};1202;${historicoBase}`, jurosRecebidos);
  addIfNotZero(output, `${local};${dataBaixa};1377;${debitoPadrao};${desconto};2082;${historicoBase}`, desconto);
  addIfNotZero(output, `${local};${dataBaixa};${debitoPadrao};1112;${multa};1997;${historicoBase}`, multa);
  addIfNotZero(output, `${local};${dataBaixa};1377;${debitoPadrao};${taxaAdministradora};2082;${historicoBase}`, taxaAdministradora);

  if (extraRecordNeeded) {
    const contaFilial = CONTAS_FILIAIS[empresa];
    addIfNotZero(output, `0001;${dataBaixa};${bancoOriginal};${contaFilial};${valorColunaS};1200;${historicoBase}`, valorColunaS);
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
    console.log("Nenhuma linha foi processada. O arquivo TXT não será gerado.");
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo335(inputExcelPath: string, outputTxtPath: string): Promise<void> {
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
