import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para remover acentos e espaços desnecessários
function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Função para processar os dados conforme a regra 349 para N&P – DEPÓSITOS EXTRA
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

    // Obter a informação da coluna B (índice 2) como string
    const filial = row[2] ? row[2].toString().trim() : '';
    if (!['13', '14', '15'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    // Obter demais campos:
    // BANCO – coluna V (índice 22)
    const banco = row[22] ? row[22].toString().trim() : '';
    // Nome do cliente – coluna G (índice 7)
    const nomeCliente = row[7]
      ? normalizeText(row[7].toString().trim())
      : 'CLIENTE_DESCONHECIDO';
    // Data da baixa – coluna R (índice 18): usa apenas a parte da data
    const dataBaixa = row[18]
      ? row[18].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    // Valor da baixa – coluna S (índice 19)
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : '0.00';
    if (parseFloat(valorBaixa) <= 0) return;

    // Histórico: "1193;" concatenado com o nome do cliente
    const historico = `1193;${nomeCliente}`;

    if (filial === '13') {
      // Lançamento único na Matriz
      // D = BANCO, C = 893
      output.push(`0001;${dataBaixa};${banco};893;${valorBaixa};${historico}`);
    } else if (filial === '14' || filial === '15') {
      // Lançamento na Filial:
      // Definindo o código do local conforme a filial:
      // Se "14" → local = "0002"; se "15" → local = "0003"
      let localFilial = '';
      if (filial === '14') localFilial = '0002';
      else if (filial === '15') localFilial = '0003';

      // Lançamento na filial: D = 1514, C = 893
      output.push(
        `${localFilial};${dataBaixa};1514;893;${valorBaixa};${historico}`,
      );

      // Lançamento extra na Matriz:
      // Local fixo = "0001"
      // D = BANCO (coluna V) e C = (se filial "14" → 1513, se "15" → 5104)
      let extraAccount = '';
      if (filial === '14') extraAccount = '1513';
      else if (filial === '15') extraAccount = '5104';
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
