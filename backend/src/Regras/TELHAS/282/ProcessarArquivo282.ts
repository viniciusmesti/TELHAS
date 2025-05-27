import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE   = '0001';
const FILIAL_CODE_3 = '0003';
const FILIAL_CODE_4 = '0004';
const FILIAL_CODE_5 = '0005';
const FILIAL_CODE_6 = '0006';

const CC_MATRIZ = '712';

const CONTA_JUROS_RECEBIDOS = '1120';
const CONTA_DESCONTO        = '1377';
const CONTA_MULTA           = '1112';

const CONTA_FILIAL_3 = '1000';
const CONTA_FILIAL_4 = '2053';
const CONTA_FILIAL_5 = '2054';
const CONTA_FILIAL_6 = '2256';

const TIPO_RELATORIO_PROCESSAR = '282';

function normalizeText(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
}

function buildHistorico(
  codigo: string,
  historicoI: string,
  historicoG: string,
  isJurosOuMulta: boolean, 
  numeroNota: string
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
    if (rowNumber > 1) { 
      rows.push(row.values as ExcelRow);
    }
  });

  return rows;
}

function processRow(row: ExcelRow, index: number, output: string[]): void {
  const tipoRelatorio = row[1]?.toString().trim();
  const filial = row[2]?.toString().trim();

  if (!/^[0-9]+$/.test(filial)) {
    console.log(`Linha ${index + 1} ignorada: Filial inválida (${filial}).`);
    return;
  }

  if (tipoRelatorio !== TIPO_RELATORIO_PROCESSAR) {
    console.log(`Linha ${index + 1} ignorada: Tipo de relátorio "${tipoRelatorio}" nao corresponde a "${TIPO_RELATORIO_PROCESSAR}".`);
    return;
  }

  const dataCredito = row[18]?.split(' ')[0] || '';
  const valorDesdobramento = parseFloat(row[15] || '0').toFixed(2);
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2);
  const valorDesconto = parseFloat(row[29] || '0').toFixed(2);
  const valorJuros = (parseFloat(row[30] || '0') + parseFloat(row[32] || '0')).toFixed(2);
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
    isJurosOuMulta: boolean = false
  ) => {
    if (parseFloat(valor) > 0) {
      output.push(
        buildLine(
          local,
          dataCredito,
          debito,
          credito,
          valor,
          buildHistorico(historicoCodigo, historicoI, historicoG, isJurosOuMulta, numeroNota)
        )
      );
    }
  };

  if (filial === '5') {
    // MATRIZ
    addLine(banco, cnpjOuCpf, valorDesdobramento, '1188', MATRIZ_CODE);
    addLine(banco, CONTA_JUROS_RECEBIDOS, valorJuros, '1202', MATRIZ_CODE, true);
    addLine(CONTA_DESCONTO, banco, valorDesconto, '2082', MATRIZ_CODE);
    addLine(banco, CONTA_MULTA, valorMulta, '1997', MATRIZ_CODE);
  } else if (['7', '10', '11', '12'].includes(filial)) {
    const localFilial = filial === '7' ? FILIAL_CODE_3 :
                        filial === '10' ? FILIAL_CODE_4 :
                        filial === '11' ? FILIAL_CODE_5 :
                        filial === '12' ? FILIAL_CODE_6 : '';
    const filialConta = filial === '7' ? CONTA_FILIAL_3 :
                        filial === '10' ? CONTA_FILIAL_4 :
                        filial === '11' ? CONTA_FILIAL_5 :
                        filial === '12' ? CONTA_FILIAL_6 : '';

    // Lançamentos dentro da FILIAL
    addLine(CC_MATRIZ, cnpjOuCpf, valorDesdobramento, '1188', localFilial);
    addLine(CC_MATRIZ, CONTA_JUROS_RECEBIDOS, valorJuros, '1202', localFilial, true);
    addLine(CONTA_DESCONTO, CC_MATRIZ, valorDesconto, '2082', localFilial);
    addLine(CC_MATRIZ, CONTA_MULTA, valorMulta, '1997', localFilial);

    // Lançamento EXTRA na MATRIZ
    addLine(banco, filialConta, valorBaixa, '1188', MATRIZ_CODE);
  } else {
    console.log(`Linha ${index + 1} ignorada: Filial não mapeada (${filial}).`);
  }

  console.log(`Linha(s) adicionada(s) (Linha ${index + 1}): ${output.slice(-5).join(' | ')}`);
}

function transformData(rows: ExcelRow[]): string[] {
  const output: string[] = [];
  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);
    processRow(row, index, output);
  });
  console.log(`Transformação concluída. Total de linhas processadas: ${output.length}`);
  return output;
}

function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo282(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados para a empresa TELHAS...');
    const transformedData = transformData(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('✅ Processo concluído com sucesso para a empresa TELHAS!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
