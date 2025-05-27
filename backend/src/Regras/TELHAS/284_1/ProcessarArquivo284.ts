import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const MATRIZ_CODE   = '0001';
const FILIAL_CODE_3 = '0003';
const FILIAL_CODE_4 = '0004';
const FILIAL_CODE_5 = '0005';
const FILIAL_CODE_6 = '0006';

const CONTA_TAXA_ADMINISTRATIVA = '1325';
const CONTA_CC_FILIAL_FIXA = '712';

const CONTA_FILIAL: Record<string, string> = {
  '7': '1000',
  '10': '2053',
  '11': '2054',
  '12': '2256',
};

const MACHINE_MAP: Record<string, string> = {
  'getnet': '551',
  'cielo': '538',
  'stone': '545',
  'bndes': '558',
  'rede': '2060',
};

function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) rows.push(row.values);
  });

  return rows;
}

export function transformData(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);

    const tipoRelatorio = row[1]?.toString().trim();
    if (tipoRelatorio !== '284/1') {
      console.log(`Linha ${index + 1} ignorada: tipo de relatório diferente de 284/1.`);
      return;
    }

    const filial = row[2]?.toString().trim();
    if (!['5', '7', '10', '11', '12'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada: filial inválida (${filial}).`);
      return;
    }

    const local = filial === '5' ? MATRIZ_CODE
                : filial === '7' ? FILIAL_CODE_3
                : filial === '10' ? FILIAL_CODE_4
                : filial === '11' ? FILIAL_CODE_5
                : filial === '12' ? FILIAL_CODE_6
                : '';

    const maquina = row[12]?.toString().trim().toLowerCase() || '';
    const contaMaquina = MACHINE_MAP[Object.keys(MACHINE_MAP).find(key => maquina.includes(key)) || ''] || maquina;

    if (!contaMaquina) {
      console.log(`Linha ${index + 1} ignorada: máquina inválida (${maquina}).`);
      return;
    }

    const dataBaixa = row[18]?.toString().split(' ')[0] || '';
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : '0.00';
    const taxaAdministrativa = row[33] ? parseFloat(row[33]).toFixed(2) : '0.00';
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : '';
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : '';
    const banco = row[22]?.toString().trim() || '';

    const historicoBase = `${normalizeText(row[12]?.toString().trim() || '')} - ${historicoG} - ${historicoI}`;

    // MATRIZ
    if (filial === '5') {
      output.push(`${local};${dataBaixa};${banco};${contaMaquina};${valorBaixa};1189;${historicoBase}`);
      output.push(`${local};${dataBaixa};${CONTA_TAXA_ADMINISTRATIVA};${contaMaquina};${taxaAdministrativa};1360;${historicoBase}`);
    }

    // FILIAIS
    if (['7', '10', '11', '12'].includes(filial)) {
      output.push(`${local};${dataBaixa};${CONTA_CC_FILIAL_FIXA};${contaMaquina};${valorBaixa};1189;${historicoBase}`);
      output.push(`${local};${dataBaixa};${CONTA_TAXA_ADMINISTRATIVA};${contaMaquina};${taxaAdministrativa};1360;${historicoBase}`);

      // Lançamento extra dentro da MATRIZ
      const contaFilial = CONTA_FILIAL[filial];
      output.push(`${MATRIZ_CODE};${dataBaixa};${banco};${contaFilial};${valorBaixa};1189;${historicoBase}`);
    }
  });

  console.log(`Transformação completa. Total de linhas geradas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  fs.writeFileSync(outputPath, data.join('\r\n'), { encoding: 'utf8' });
}

export async function processarArquivo284(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados da Regra 284/1...');
    const transformedData = transformData(rows);

    console.log('Exportando para arquivo TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('✅ Arquivo TXT da Regra 284/1 gerado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar a Regra 284:', error);
    throw new Error('Erro ao processar a Regra 284.');
  }
}
