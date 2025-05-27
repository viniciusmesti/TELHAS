import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

function normalizeText(str: any): string {
  if (!str || typeof str !== 'string') return '';
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
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
    console.error('\u274c Nenhuma planilha encontrada no arquivo.');
    throw new Error('Nenhuma planilha encontrada no arquivo.');
  }

  const rows: any[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  console.log(`✅ Total de linhas lidas: ${rows.length}`);
  return rows;
}

function getLocalAndContaExtraGrupo1(codLocal: string) {
  const map: Record<string, { local: string; contaExtra?: string }> = {
    '1': { local: '0001' },
    '3': { local: '0002', contaExtra: '995' },
    '2': { local: '0003', contaExtra: '994' },
    '4': { local: '0004', contaExtra: '996' },
  };
  return map[codLocal];
}

export function processarRegra347(rows: any[]): string[] {
  const output: string[] = [];

  const grupo1 = ['1', '2', '3', '4'];
  const grupo2 = ['501', '502', '503', '504'];

  const localMapGrupo2: Record<string, string> = {
    '501': '0001',
    '502': '0002',
    '503': '0003',
    '504': '0004',
  };
  const contaExtraGrupo2: Record<string, string> = {
    '502': '994',
    '503': '995',
    '504': '996',
  };

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 347) return;

    const codLocal = row[2]?.toString().trim() || '';
    let grupo = 0;
    if (grupo1.includes(codLocal)) grupo = 1;
    else if (grupo2.includes(codLocal)) grupo = 2;
    else return;

    const local =
      grupo === 1
        ? getLocalAndContaExtraGrupo1(codLocal)?.local
        : localMapGrupo2[codLocal];
    const banco = row[22]?.toString().trim() || '';
    const dataBaixa = row[18]
      ? row[18].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    const valor = row[19] ? parseFloat(row[19]).toFixed(2) : '0.00';
    if (parseFloat(valor) <= 0) return;

    const historicoG = row[7] ? normalizeText(row[7].toString()) : 'HIST_G';
    const historicoI = row[9] ? normalizeText(row[9].toString()) : 'HIST_I';
    const historicoAH = row[34] ? normalizeText(row[34].toString()) : 'HIST_AH';
    // Insere uma "/" entre a coluna I e a coluna AH
    const historicoBase = `3007;${historicoG} - ${historicoI}/${historicoAH}`;

    if (grupo === 1) {
      if (codLocal === '1') {
        output.push(
          `${local};${dataBaixa};${banco};1483;${valor};${historicoBase}`,
        );
      } else {
        output.push(`${local};${dataBaixa};712;1483;${valor};${historicoBase}`);
        const contaExtra = getLocalAndContaExtraGrupo1(codLocal)?.contaExtra;
        if (contaExtra) {
          output.push(
            `0001;${dataBaixa};${banco};${contaExtra};${valor};${historicoBase}`,
          );
        }
      }
    } else if (grupo === 2) {
      if (codLocal === '501') {
        output.push(
          `${local};${dataBaixa};${banco};893;${valor};${historicoBase}`,
        );
      } else {
        output.push(`${local};${dataBaixa};712;893;${valor};${historicoBase}`);
        const contaExtra = contaExtraGrupo2[codLocal];
        if (contaExtra) {
          output.push(
            `0001;${dataBaixa};${banco};${contaExtra};${valor};${historicoBase}`,
          );
        }
      }
    }
  });

  console.log(`✅ Total de linhas processadas para TELHAS: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log(
      '\u274c Nenhuma linha foi processada. Arquivo TXT não será gerado.',
    );
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`✅ Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo347(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra347(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error.message);
    throw new Error('Erro ao processar o arquivo.');
  }
}

export {};
