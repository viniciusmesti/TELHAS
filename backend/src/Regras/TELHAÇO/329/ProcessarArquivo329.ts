import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';
const CONTA_DEBITO_GRUPO1 = '1483';
const CONTA_DEBITO_GRUPO2 = '863';
const CONTA_CREDITO_FILIAL = '993';

const CONTA_FILIAL_MAPPING: Record<string, string> = {
  '2': '708',
  '3': '707',
  '4': '709',
  '502': '708',
  '503': '707',
  '504': '709',
};

const GRUPO_1 = ['1', '2', '3', '4'];
const GRUPO_2 = ['501', '502', '503', '504'];

function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath)) throw new Error(`Arquivo não encontrado: ${filePath}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) rows.push(row.values);
  });
  return rows;
}

export function processarRegra329(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const relatorio = Number(row[1]);
    if (relatorio !== 329) return;

    const empresa = row[2]?.toString().trim() || '';
    const grupo = GRUPO_1.includes(empresa) ? 1 : GRUPO_2.includes(empresa) ? 2 : 0;
    if (grupo === 0) return;

    const banco = row[22]?.toString().trim() || '';
    const data = row[18]?.toString().split(' ')[0] || '';
    const valor = parseFloat(row[19] || '0').toFixed(2);
    if (valor === '0.00') return;

    const historicoG = normalizeText(row[7]?.toString() || '');
    const historicoI = normalizeText(row[9]?.toString() || '');
    const historico = `1850;${historicoG} - ${historicoI}`;

    const contaFilial = CONTA_FILIAL_MAPPING[empresa];

    if (grupo === 1) {
      if (empresa === '1') {
        // MATRIZ
        output.push(`${MATRIZ_CODE};${data};${CONTA_DEBITO_GRUPO1};${banco};${valor};${historico}`);
      } else {
        // FILIAIS GRUPO 1
        output.push(`${MATRIZ_CODE};${data};${CONTA_DEBITO_GRUPO1};${CONTA_CREDITO_FILIAL};${valor};${historico}`);
        output.push(`${MATRIZ_CODE};${data};${contaFilial};${banco};${valor};${historico}`);
      }
    } else if (grupo === 2) {
      if (empresa === '501') {
        // MATRIZ
        output.push(`${MATRIZ_CODE};${data};${CONTA_DEBITO_GRUPO2};${banco};${valor};${historico}`);
      } else {
        // FILIAIS GRUPO 2
        output.push(`${MATRIZ_CODE};${data};${CONTA_DEBITO_GRUPO2};${CONTA_CREDITO_FILIAL};${valor};${historico}`);
        output.push(`${MATRIZ_CODE};${data};${contaFilial};${banco};${valor};${historico}`);
      }
    }
  });

  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log("Nenhuma linha processada. O arquivo não será gerado.");
    return;
  }
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
  console.log(`✅ Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo329(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Iniciando processamento da Regra 329...');
    const rows = await readExcelFile(inputExcelPath);
    const transformed = processarRegra329(rows);
    exportToTxt(transformed, outputTxtPath);
    console.log('✅ Processamento da Regra 329 concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar a Regra 329:', error);
    throw error;
  }
}
