import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';
const FILIAL_CODE_3 = '0003';
const FILIAL_CODE_4 = '0004';
const FILIAL_CODE_5 = '0005';
const FILIAL_CODE_6 = '0006';

function normalizeText(str: any): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
  console.log(`📂 Lendo arquivo: ${filePath}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    console.error('❌ Nenhuma planilha encontrada no arquivo.');
    throw new Error('Nenhuma planilha encontrada no arquivo.');
  }
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });
  console.log(`✅ Total de linhas lidas: ${rows.length}`);
  return rows;
}

export function processarRegra337(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 337) return;

    const filial = row[2] ? row[2].toString().trim() : '';
    if (!['5', '7', '10', '11', '12'].includes(filial)) return;

    let local = '';
    if (filial === '5') local = MATRIZ_CODE;
    else if (filial === '7') local = FILIAL_CODE_3;
    else if (filial === '10') local = FILIAL_CODE_4;
    else if (filial === '11') local = FILIAL_CODE_5;
    else if (filial === '12') local = FILIAL_CODE_6;

    let cnpjCliente = row[8] ? row[8].toString().trim() : 'CNPJ_CLIENTE';
    cnpjCliente = cnpjCliente.replace(/\s+/g, '');

    const historicoG = normalizeText(row[7] ? row[7].toString() : 'HIST_G');
    const historicoI = normalizeText(row[9] ? row[9].toString() : 'HIST_I');
    const historicoBase = `2082;${historicoG} - ${historicoI}`;

    const dataBaixa = row[18]
      ? row[18].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    const valor = row[15] ? parseFloat(row[15]).toFixed(2) : '0.00';

    if (parseFloat(valor) <= 0) return;

    output.push(
      `${local};${dataBaixa};1377;${cnpjCliente};${valor};${historicoBase}`,
    );
  });

  console.log(`✅ Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log(
      '❌ Nenhuma linha foi processada. Arquivo TXT não será gerado.',
    );
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`✅ Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo337(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra337(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error.message);
    throw new Error('Erro ao processar o arquivo.');
  }
}
