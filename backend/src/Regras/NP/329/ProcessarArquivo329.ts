import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para normalizar texto (remove diacríticos, espaços extras, etc.)
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
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });
  return rows;
}

export function processarRegra329(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Linha ${index + 1} - Raw Data:`, row);

    // Verifica se o código do relatório é 329 (coluna A – índice 1)
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 329) {
      console.log(
        `Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`,
      );
      return;
    }

    // Obtenha a informação da coluna B (índice 2) como string
    const filialStr = row[2] ? row[2].toString().trim() : '';
    // Defina os dois grupos:
    const grupo1 = ['13', '14', '15'];
    const grupo2 = ['513', '514', '515'];

    let grupo = 0;
    if (grupo1.includes(filialStr)) {
      grupo = 1;
    } else if (grupo2.includes(filialStr)) {
      grupo = 2;
    } else {
      console.log(
        `Linha ${index + 1} ignorada - Filial inválida: ${filialStr}`,
      );
      return;
    }

    // Mapeamento do local:
    // Grupo 1: "13" → "0001", "14" → "0002", "15" → "0003"
    // Grupo 2: "513" → "0001", "514" → "0002", "515" → "0003"
    let local = '';
    if (grupo === 1) {
      if (filialStr === '13') local = '0001';
      else if (filialStr === '14') local = '0002';
      else if (filialStr === '15') local = '0003';
    } else if (grupo === 2) {
      if (filialStr === '513') local = '0001';
      else if (filialStr === '514') local = '0002';
      else if (filialStr === '515') local = '0003';
    }

    // Obtenha os demais campos:
    // Coluna V (índice 22): BANCO (como string)
    const banco = row[22]?.toString().trim() || '';
    // Coluna R (índice 18): Data da baixa (ignorar horário)
    const dataBaixa = row[18] ? row[18].toString().split(' ')[0] : '';
    // Coluna S (índice 19): Valor da baixa
    const valorBaixa = row[19] ? parseFloat(row[19] || '0').toFixed(2) : '0.00';
    if (valorBaixa === '0.00') return;
    // Colunas G (índice 7) e I (índice 9): para o histórico
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : '';
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : '';
    const historico = `${historicoG} - ${historicoI}`;

    // Processa conforme o grupo:
    if (grupo === 1) {
      // 1º SITUAÇÃO (coluna B = 13, 14 ou 15)
      if (filialStr === '13') {
        // Matriz: D = 1483 e C = BANCO (coluna V)
        output.push(
          `${local};${dataBaixa};1483;${banco};${valorBaixa};1850;${historico}`,
        );
      } else if (filialStr === '14' || filialStr === '15') {
        // Nas filiais:
        // Lançamento na filial: D = 1483, C = 1516 (conta corrente fixa)
        output.push(
          `${local};${dataBaixa};1483;1516;${valorBaixa};1850;${historico}`,
        );
        // Lançamento extra na Matriz:
        let extraAccount = '';
        if (filialStr === '14') extraAccount = '1513';
        else if (filialStr === '15') extraAccount = '5104';
        output.push(
          `0001;${dataBaixa};${extraAccount};${banco};${valorBaixa};1850;${historico}`,
        );
      }
    } else if (grupo === 2) {
      // 2º SITUAÇÃO (coluna B = 513, 514 ou 515)
      if (filialStr === '513') {
        // Matriz: D = 863, C = BANCO
        output.push(
          `${local};${dataBaixa};863;${banco};${valorBaixa};1850;${historico}`,
        );
      } else if (filialStr === '514' || filialStr === '515') {
        // Nas filiais:
        // Lançamento na filial: D = 863, C = 1516 (fixo)
        output.push(
          `${local};${dataBaixa};863;1516;${valorBaixa};1850;${historico}`,
        );
        // Lançamento extra na Matriz:
        let extraAccount = '';
        if (filialStr === '514') extraAccount = '1513';
        else if (filialStr === '515') extraAccount = '5104';
        output.push(
          `0001;${dataBaixa};${extraAccount};${banco};${valorBaixa};1850;${historico}`,
        );
      }
    }
  });

  console.log(`Total de linhas processadas: ${output.length}`);
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
    console.log('Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra329(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
