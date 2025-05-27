import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para remover acentos e espaços desnecessários
function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, '')
    .trim();
}

// Função para ler o arquivo Excel
export async function readExcelFile(filePath: string): Promise<any[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }
  console.log(`📂 Lendo arquivo: ${filePath}`);
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

// Função para processar os dados conforme a regra 349 para TELHAS – DEPÓSITOS EXTRA
export function processarRegra349(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Linha ${index + 1} - Raw Data:`, row);

    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 349) {
      console.log(
        `Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`,
      );
      return;
    }

    const filial = row[2] ? row[2].toString().trim() : '';
    if (!['5', '7', '10', '11', '12'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    const banco = row[22] ? row[22].toString().trim() : '';
    const nomeCliente = row[7]
      ? normalizeText(row[7].toString().trim())
      : 'CLIENTE_DESCONHECIDO';
    const dataBaixa = row[18]
      ? row[18].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : '0.00';
    if (parseFloat(valorBaixa) <= 0) return;

    const historico = `1193;${nomeCliente}`;

    if (filial === '5') {
      output.push(`0001;${dataBaixa};${banco};893;${valorBaixa};${historico}`);
    } else {
      let localFilial = '';
      let extraAccount = '';

      switch (filial) {
        case '7':
          localFilial = '0003';
          extraAccount = '1000';
          break;
        case '10':
          localFilial = '0004';
          extraAccount = '2053';
          break;
        case '11':
          localFilial = '0005';
          extraAccount = '2054';
          break;
        case '12':
          localFilial = '0006';
          extraAccount = '2256';
          break;
      }

      output.push(
        `${localFilial};${dataBaixa};1514;893;${valorBaixa};${historico}`,
      );
      output.push(
        `0001;${dataBaixa};${banco};${extraAccount};${valorBaixa};${historico}`,
      );
    }
  });

  console.log(`Total de linhas processadas: ${output.length}`);
  return output;
}

// Função para exportar os dados para um arquivo TXT
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

// Função principal para processar o arquivo
export async function processarArquivo349(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra349(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
