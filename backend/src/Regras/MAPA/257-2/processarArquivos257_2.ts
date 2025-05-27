import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Locais de saida
const LOCAL_MATRIZ    = '0001';  
const LOCAL_FILIAL_2  = '0002';

// Contas contábeis fixas
const CONTA_CHEQUES_RECEBER       = '1483';
const CONTA_C_C_MATRIZ            = '1514';
const CONTA_ADIANTAMENTO_CLIENTE  = '893';
const CONTA_BANCO_FILIAL_2        = '1513';
const CONTA_FILIAL_EXTRA          = '1515';

// Tipo de relatório a ser processado
const TIPO_RELATORIO_PROCESSAR = '257/2';

function normalizeText(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
}

// Constroi o histórico para os lançamentos de Adiantamentos de Cliente.
// Utiliza apenas o nome do cliente - Coluna G
function buildHistoricoAdiant(nomeCliente: string): string {
  return `1193;${nomeCliente}`;
}

// Histórico para os lançamentos de cheques a receber
// Utiliza o nome do cliente e o nº do documento – colunas G e I

function buildHistoricoCheq(nomeCliente: string, docNumero: string): string {
  return `1193;${nomeCliente}${docNumero ? ' - ' + docNumero : ''}`;
}

function buildLine(
  local: string,
  dataBaixa: string,
  campoBanco: string,
  conta: string,
  valor: string,
  historico: string
): string {
  return `${local};${dataBaixa};${campoBanco};${conta};${valor};${historico}`;
}

export async function readExcelFile(filePath: string): Promise<any[]> {
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

function processRow(row: any[], rowIndex: number): string[] {
  const outputLines: string[] = [];

  const tipoRelatorio = row[1]?.toString().trim();
  if (tipoRelatorio !== TIPO_RELATORIO_PROCESSAR) {
    console.log(`Linha ${rowIndex + 1} ignorada: Tipo de relatório ${tipoRelatorio} não corresponde a ${TIPO_RELATORIO_PROCESSAR}.`);
    return outputLines;
  }

  const empresa = parseInt(row[2]);
  const banco       = row[22]?.toString() || '';
  const dataBaixa   = row[14]?.split(' ')[0] || '';
  const valorBaixa  = parseFloat(row[19] || '0').toFixed(2); // Coluna S
  const nomeCliente = row[7] ? normalizeText(row[7].toString().trim()) : '';
  const docNumero   = row[9] ? normalizeText(row[9].toString().trim()) : '';

  const historicoAdiant = buildHistoricoAdiant(nomeCliente);
  const historicoCheq   = buildHistoricoCheq(nomeCliente, docNumero);

  switch (empresa) {
    // 506 - Matriz → Adiantamento
    case 506:
      outputLines.push(buildLine(LOCAL_MATRIZ, dataBaixa, banco, CONTA_ADIANTAMENTO_CLIENTE, valorBaixa, historicoAdiant));
      break;

    // 509 - Filial 2 → Adiantamento + extra na matriz
    case 509:
      outputLines.push(buildLine(LOCAL_FILIAL_2, dataBaixa, CONTA_C_C_MATRIZ, CONTA_ADIANTAMENTO_CLIENTE, valorBaixa, historicoAdiant));
      outputLines.push(buildLine(LOCAL_MATRIZ, dataBaixa, banco, CONTA_FILIAL_EXTRA, valorBaixa, historicoAdiant));
 // Extra da Filial
      break;

    // 6 - Matriz → Cheques a Receber
    case 6:
      outputLines.push(buildLine(LOCAL_MATRIZ, dataBaixa, banco, CONTA_CHEQUES_RECEBER, valorBaixa, historicoCheq));
      break;

    // 9 - Filial 2 → Cheques a Receber + extra na matriz
    case 9:
      outputLines.push(buildLine(LOCAL_FILIAL_2, dataBaixa, CONTA_C_C_MATRIZ, CONTA_CHEQUES_RECEBER, valorBaixa, historicoCheq));
      outputLines.push(buildLine(LOCAL_MATRIZ, dataBaixa, banco, CONTA_FILIAL_EXTRA, valorBaixa, historicoAdiant));// Extra da Filial
      break;

    default:
      console.log(`Linha ${rowIndex + 1} ignorada: Empresa ${empresa} não reconhecida.`);
      break;
  }

  return outputLines;
}


export function transformData(rows: any[]): string[] {
  let output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);
    const linhasProcessadas = processRow(row, index);
    output = output.concat(linhasProcessadas);
  });

  console.log(`Transformação concluída. Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  data.push(''); // Linha vazia ao final (opcional)
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo257_2(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados para N&P...');
    const transformedData = transformData(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('✅ Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}