import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para normalizar texto
function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
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

export function transformarRegra329(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 329) {
      console.log(
        `Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`,
      );
      return;
    }

    const empresa = row[2]?.toString().trim();
    if (!['6', '9', '506', '509'].includes(empresa)) {
      console.log(`Linha ${index + 1} ignorada - Empresa inválida: ${empresa}`);
      return;
    }

    let local = '';
    let grupo = '';

    // Determina o grupo e local
    if (empresa === '6') {
      grupo = '1';
      local = '0001';
    } else if (empresa === '9') {
      grupo = '1';
      local = '0002';
    } else if (empresa === '506') {
      grupo = '2';
      local = '0001';
    } else if (empresa === '509') {
      grupo = '2';
      local = '0002';
    }

    const banco = row[22]?.toString().trim() || '';
    const dataBaixa = row[18]?.toString().split(' ')[0] || '';
    const valorBaixa = row[19] ? parseFloat(row[19] || '0').toFixed(2) : '0.00';
    if (valorBaixa === '0.00') return;

    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : '';
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : '';
    const historico = `1850;${historicoG} - ${historicoI}`;

    // Grupo 1: empresas 6 (matriz), 9 (filial)
    if (grupo === '1') {
      if (empresa === '6') {
        // MATRIZ
        output.push(
          `${local};${dataBaixa};1483;${banco};${valorBaixa};${historico}`,
        );
      } else if (empresa === '9') {
        // FILIAL
        output.push(
          `${local};${dataBaixa};1483;1516;${valorBaixa};${historico}`,
        );
        output.push(
          `0001;${dataBaixa};1513;${banco};${valorBaixa};${historico}`,
        );
      }
    }

    // Grupo 2: empresas 506 (matriz), 509 (filial)
    else if (grupo === '2') {
      if (empresa === '506') {
        output.push(
          `${local};${dataBaixa};863;${banco};${valorBaixa};${historico}`,
        );
      } else if (empresa === '509') {
        output.push(
          `${local};${dataBaixa};863;1516;${valorBaixa};${historico}`,
        );
        output.push(
          `0001;${dataBaixa};1513;${banco};${valorBaixa};${historico}`,
        );
      }
    }
  });

  console.log(`Regra 329 - Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log('Nenhuma linha foi processada. O arquivo TXT não será gerado.');
    return;
  }

  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo329(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('Iniciando processamento da Regra 329...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = transformarRegra329(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Regra 329 processada com sucesso!');
  } catch (error) {
    console.error('Erro ao processar a Regra 329:', error);
    throw new Error('Erro ao processar a Regra 329.');
  }
}

export {};
