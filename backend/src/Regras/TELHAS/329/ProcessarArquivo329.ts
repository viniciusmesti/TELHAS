import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE = '0001';

const CONTAS_EXTRA_MATRIZ: Record<string, string> = {
  '7': '713',
  '10': '2047',
  '11': '2048',
  '12': '2255',
  '507': '713',
  '510': '2047',
  '511': '2048',
  '512': '2255',
};

const CNPJ_GRUPO1 = ['5', '7', '10', '11', '12'];
const CNPJ_GRUPO2 = ['505', '507', '510', '511', '512'];

function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
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

export function processarRegra329(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const relatorio = Number(row[1]);
    if (relatorio !== 329) {
      console.log(`Linha ${index + 1} ignorada - Relatório: ${relatorio}`);
      return;
    }

    const empresa = row[2]?.toString().trim() || '';
    const grupo = CNPJ_GRUPO1.includes(empresa)
      ? 1
      : CNPJ_GRUPO2.includes(empresa)
        ? 2
        : 0;

    if (grupo === 0) {
      console.log(`Linha ${index + 1} ignorada - Empresa inválida: ${empresa}`);
      return;
    }

    const local = MATRIZ_CODE;
    const banco = row[22]?.toString().trim() || '';
    const dataBaixa = row[18]?.toString().split(' ')[0] || '';
    const valor = parseFloat(row[19] || '0').toFixed(2);
    if (valor === '0.00') return;

    const historicoG = normalizeText(row[7]?.toString() || '');
    const historicoI = normalizeText(row[9]?.toString() || '');
    const historico = `1850;${historicoG} - ${historicoI}`;

    const isMatriz =
      (grupo === 1 && empresa === '5') || (grupo === 2 && empresa === '505');

    const isFilialGrupo1 =
      grupo === 1 && ['7', '10', '11', '12'].includes(empresa);
    const isFilialGrupo2 =
      grupo === 2 && ['507', '510', '511', '512'].includes(empresa);

    if (grupo === 1) {
      if (isMatriz) {
        output.push(
          `${local};${dataBaixa};1483;${banco};${valor};${historico}`,
        );
      } else if (isFilialGrupo1) {
        output.push(`${local};${dataBaixa};1483;999;${valor};${historico}`);
        const contaExtra = CONTAS_EXTRA_MATRIZ[empresa];
        output.push(
          `${MATRIZ_CODE};${dataBaixa};${contaExtra};${banco};${valor};${historico}`,
        );
      }
    } else if (grupo === 2) {
      if (isMatriz) {
        output.push(`${local};${dataBaixa};863;${banco};${valor};${historico}`);
      } else if (isFilialGrupo2) {
        output.push(`${local};${dataBaixa};863;999;${valor};${historico}`);
        const contaExtra = CONTAS_EXTRA_MATRIZ[empresa];
        output.push(
          `${MATRIZ_CODE};${dataBaixa};${contaExtra};${banco};${valor};${historico}`,
        );
      }
    }
  });

  console.log(`Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log('Nenhuma linha processada. O arquivo não será gerado.');
    return;
  }
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
  console.log(`✅ Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo329(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
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
