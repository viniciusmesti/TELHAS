import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';
const FILIAL_CODE_2 = '0002';
const FILIAL_CODE_3 = '0003';

const FILIAL_ACCOUNT = '1514';

const CONTA_JUROS_RECEBIDOS = '1120';
const CONTA_DESCONTO = '1377';
const CONTA_MULTA = '1112';

const CONTA_FILIAL_2 = '1515';
const CONTA_FILIAL_3 = '5105';

const TIPO_RELATORIO_PROCESSAR = '282';

function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
    console.log(
      `Linha ${index + 1} ignorada: Tipo de relátorio "${tipoRelatorio}" nao corresponde a "${TIPO_RELATORIO_PROCESSAR}".`,
    );
    return;
  }

  const dataCredito = row[18]?.split(' ')[0] || '';
  const valorDesdobramento = parseFloat(row[15] || '0').toFixed(2);
  const cnpjOuCpf = row[8]?.toString() || '';
  const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : '';
  const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : '';
  const banco = row[22]?.toString() || '';
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2);
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

  if (filial === '13') {
    addLine(banco, cnpjOuCpf, valorDesdobramento, '1188', MATRIZ_CODE);
    addLine(
      banco,
      CONTA_JUROS_RECEBIDOS,
      (parseFloat(row[30] || '0') + parseFloat(row[32] || '0')).toFixed(2),
      '1202',
      MATRIZ_CODE,
      true,
    );
    addLine(
      '1377',
      banco,
      parseFloat(row[29] || '0').toFixed(2),
      '2082',
      MATRIZ_CODE,
    );
    addLine(
      banco,
      CONTA_MULTA,
      parseFloat(row[31] || '0').toFixed(2),
      '1997',
      MATRIZ_CODE,
    );
  } else if (filial === '14' || filial === '15') {
    const localFilial = filial === '14' ? FILIAL_CODE_2 : FILIAL_CODE_3;

    addLine(FILIAL_ACCOUNT, cnpjOuCpf, valorDesdobramento, '1188', localFilial);
    addLine(
      FILIAL_ACCOUNT,
      CONTA_JUROS_RECEBIDOS,
      (parseFloat(row[30] || '0') + parseFloat(row[32] || '0')).toFixed(2),
      '1202',
      localFilial,
      true,
    );
    addLine(
      '1377',
      FILIAL_ACCOUNT,
      parseFloat(row[29] || '0').toFixed(2),
      '2082',
      localFilial,
    );
    addLine(
      FILIAL_ACCOUNT,
      CONTA_MULTA,
      parseFloat(row[31] || '0').toFixed(2),
      '1997',
      localFilial,
    );

    const filialConta = filial === '14' ? CONTA_FILIAL_2 : CONTA_FILIAL_3;
    addLine(banco, filialConta, valorBaixa, '1188', MATRIZ_CODE);
  } else {
    console.log(`Linha ${index + 1} ignorada: Filial nao mapeada (${filial}).`);
  }

  console.log(
    `Linha(s) adicionada(s) (Linha ${index + 1}): ${output.slice(-4).join(' | ')}`,
  );
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
  data.push(''); // Adiciona uma linha vazia ao final (opcional)
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo282(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados para a empresa N&P...');
    const transformedData = transformData(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('✅ Processo concluído com sucesso para a empresa N&P!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
