import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  console.log(
    'Planilhas disponíveis:',
    workbook.worksheets.map((s) => s.name),
  );
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  console.log(`Total de linhas lidas: ${rows.length}`);
  return rows;
}

export function processarRegra336(rows: any[]): string[] {
  const output: string[] = [];

  const CODE_MATRIZ = '0001';
  const CODE_PARANAVAI = '0002'; // filial 3
  const CODE_UMUARAMA = '0003'; // filial 2
  const CODE_CAMPO_MOURAO = '0004';

  const toNum = (v: any) => parseFloat(v ?? '0');

  rows.forEach((row) => {
    // só processa relatório 336
    if (Number(row[1]) !== 336) return;

    // verifica filial válida
    const filial = (row[2] ?? '').toString().trim();
    if (!['1', '2', '3', '4'].includes(filial)) return;

    // mapeia para o código correto
    const local =
      filial === '1'
        ? CODE_MATRIZ
        : filial === '2'
          ? CODE_PARANAVAI
          : filial === '3'
            ? CODE_UMUARAMA
            : CODE_CAMPO_MOURAO;

    // extrai data de baixa (coluna R = index 18)
    let dataBaixa: string;
    const cell = row[18];
    if (cell instanceof Date) {
      dataBaixa = cell.toISOString().split('T')[0];
    } else {
      dataBaixa = cell?.toString().split(' ')[0] ?? '';
    }

    // dados do cliente e histórico
    const cnpjCliente = normalizeText(row[8]?.toString() ?? '');
    const historicoI = normalizeText(row[9]?.toString() ?? '');
    const historicoG = normalizeText(row[7]?.toString() ?? '');
    const historicoBase = `${historicoI} - ${historicoG}`;

    // valores monetários
    const valorDesdob = toNum(row[15]).toFixed(2); // coluna O
    const jurosRecebidos = (toNum(row[30]) + toNum(row[32])).toFixed(2); // AD + AF
    const desconto = toNum(row[29]).toFixed(2); // AC
    const multa = toNum(row[31]).toFixed(2); // AE

    // gera lançamentos conforme regra
    if (+valorDesdob > 0) {
      output.push(
        `${local};${dataBaixa};893;${cnpjCliente};${valorDesdob};2081;${historicoBase}`,
      );
    }
    if (+jurosRecebidos > 0) {
      output.push(
        `${local};${dataBaixa};893;1120;${jurosRecebidos};1202;${historicoBase}`,
      );
    }
    if (+desconto > 0) {
      output.push(
        `${local};${dataBaixa};1377;893;${desconto};2082;${historicoBase}`,
      );
    }
    if (+multa > 0) {
      output.push(
        `${local};${dataBaixa};893;1112;${multa};1997;${historicoBase}`,
      );
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
  data.push(''); // linha em branco final
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo336(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra336(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
