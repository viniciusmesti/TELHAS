import * as unorm from 'unorm';

const COL_TIPO_LANCAMENTO   = 1;  // Coluna A
const COL_FILIAL            = 2;  // Coluna B
const COL_HISTORICO_G       = 7;  // Coluna G
const COL_CNPJ_CPF          = 8;  // Coluna H
const COL_HISTORICO_I       = 9;  // Coluna I
const COL_DATA              = 14; // Coluna N (data com horário)
const COL_VALOR_DESDOBRAMENTO = 15; // Coluna O
const COL_TIPO_OPERACAO     = 36; // Coluna AJ
const COL_JUROS_1           = 30; // Coluna AD
const COL_DESCONTO          = 29; // Coluna AC
const COL_MULTA             = 31; // Coluna AE
const COL_JUROS_2           = 32; // Coluna AF

// Contas fixas para a regra
const ACCOUNT_CHEQUES_RECEBER  = '1483';
const ACCOUNT_JUROS_RECEBIDOS  = '1120';
const ACCOUNT_MULTA            = '1112';
const ACCOUNT_DESCONTO         = '1377';
const ACCOUNT_ADIANTAMENTO     = '893';

// Mapeamento de filiais para N&P (exemplo – ajuste conforme a regra de N&P)
const FILIAL_MAPPING: { [key: number]: string } = {
  13: '0001', // Matriz
  14: '0002', // Filial 2
  15: '0003', // Filial 3
};

/**
 * Remove acentos de uma string utilizando normalização Unicode.
 */
export function removeAcentos(str: string): string {
  return unorm.nfd(str).replace(/[\u0300-\u036f]/g, '');
}

/**
 * Cria uma linha de saída formatada.
 */
function createOutputLine(
  filialCode: string,
  date: string,
  accountDebit: string,
  accountCredit: string,
  value: string,
  transactionCode: string,
  historical: string
): string {
  return `${filialCode};${date};${accountDebit};${accountCredit};${value};${transactionCode};${historical}`;
}

/**
 * Processa uma única linha de lançamentos (cheques) conforme a regra 255 para N&P.
 */
function processChequesRow(row: any[], rowIndex: number): string[] {
  const outputLines: string[] = [];

  const tipoLancamento = row[COL_TIPO_LANCAMENTO];
  const filial         = row[COL_FILIAL];
  const tipoOperacao   = row[COL_TIPO_OPERACAO];
  const dateRaw        = row[COL_DATA];
  const date           = dateRaw ? dateRaw.split(' ')[0] : '';
  const valorDesdobramento = parseFloat(row[COL_VALOR_DESDOBRAMENTO] || 0).toFixed(2);
  const cnpjOuCpf      = row[COL_CNPJ_CPF];
  const historicoG     = row[COL_HISTORICO_G];
  const historicoI     = row[COL_HISTORICO_I];
  const historicalText = `${historicoI} - ${historicoG}`;

  const filialCode = FILIAL_MAPPING[filial];
  if (!filialCode) {
    console.log(`Linha ${rowIndex + 1} ignorada: Filial não correspondente`);
    return outputLines;
  }

  if (tipoLancamento !== '255') return outputLines;

  // Se o tipo de operação NÃO for 1655, é entrada de cheques; caso contrário, é adiantamento
  if (tipoOperacao !== 1655) {
    const line = createOutputLine(
      filialCode,
      date,
      ACCOUNT_CHEQUES_RECEBER,
      cnpjOuCpf,
      valorDesdobramento,
      '1989',
      historicalText
    );
    outputLines.push(line);
    console.log(`Linha adicionada: ${line}`);
  } else {
    const line = createOutputLine(
      filialCode,
      date,
      ACCOUNT_CHEQUES_RECEBER,
      ACCOUNT_ADIANTAMENTO,
      valorDesdobramento,
      '1989',
      historicalText
    );
    outputLines.push(line);
    console.log(`Linha de adiantamento adicionada: ${line}`);
  }

  // Juros
  const jurosValue = (
    parseFloat(row[COL_JUROS_1] || 0) +
    parseFloat(row[COL_JUROS_2] || 0)
  ).toFixed(2);
  if (parseFloat(jurosValue) > 0) {
    const line = createOutputLine(
      filialCode,
      date,
      ACCOUNT_CHEQUES_RECEBER,
      ACCOUNT_JUROS_RECEBIDOS,
      jurosValue,
      '1202',
      historicalText
    );
    outputLines.push(line);
    console.log(`Linha de juros adicionada: ${line}`);
  }

  // Desconto
  const descontoValue = parseFloat(row[COL_DESCONTO] || 0).toFixed(2);
  if (parseFloat(descontoValue) > 0) {
    const line = createOutputLine(
      filialCode,
      date,
      ACCOUNT_DESCONTO,
      ACCOUNT_CHEQUES_RECEBER,
      descontoValue,
      '2082',
      historicalText
    );
    outputLines.push(line);
    console.log(`Linha de desconto adicionada: ${line}`);
  }

  // Multa
  const multaValue = parseFloat(row[COL_MULTA] || 0).toFixed(2);
  if (parseFloat(multaValue) > 0) {
    const line = createOutputLine(
      filialCode,
      date,
      ACCOUNT_CHEQUES_RECEBER,
      ACCOUNT_MULTA,
      multaValue,
      '1997',
      historicalText
    );
    outputLines.push(line);
    console.log(`Linha de multa adicionada: ${line}`);
  }

  return outputLines;
}

/**
 * Função que transforma os dados lidos do Excel conforme a regra 255 para N&P.
 */
export function transformarRegra255(rows: any[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);
    const processedLines = processChequesRow(row, index);
    output.push(...processedLines);
  });
  console.log(`Transformação concluída. Total de linhas processadas: ${output.length}`);
  return output;
}
