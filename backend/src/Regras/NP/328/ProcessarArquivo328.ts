import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// N&P - Regra 328
// Função para remover acentos e caracteres especiais
function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, '');
} 

// Função para ler o arquivo Excel
export async function readExcelFile(filePath: string): Promise<any[]> {
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

// Função para transformar os dados com base na regra N&P 328
export function processarRegra328(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Linha ${index + 1} - Raw Data:`, row);

    // Verifica se o código do relatório é 328 (coluna A – índice 1)
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 328) {
      console.log(`Linha ${index + 1} ignorada - Código Relatório: ${codigoRelatorio}`);
      return;
    }

    // Para N&P, a coluna “B” (índice 2) indica o local e deve ser 13, 14 ou 15
    const empresa = row[2] ? row[2].toString().trim() : "";
    if (!["13", "14", "15"].includes(empresa)) {
      console.log(`Linha ${index + 1} ignorada - Empresa inválida: ${empresa}`);
      return;
    }

    // Mapeamento do local
    let local = "";
    if (empresa === "13") local = "0001"; // Matriz - LONDRINA
    else if (empresa === "14") local = "0002"; // Filial 2 – PRUDENTE
    else if (empresa === "15") local = "0003"; // Filial 3 - UMUARAMA

    // Coluna V (índice 22): identifica se é CAIXA ou BANCO
    const banco = Number(row[22]) || null;

    // Coluna R (índice 18): Data da baixa (ignorar o horário)
    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";

    // Coluna S (índice 19): Valor da baixa
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";

    // Colunas G (índice 7) e I (índice 9): informações para o histórico
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : "HIST_G";
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : "HIST_I";
    const historicoBase = `2051;${historicoG} - ${historicoI}`;

    console.log(`Linha ${index + 1} - Código=${codigoRelatorio}, Empresa=${empresa}, Banco=${banco}, Data=${dataBaixa}, Valor=${valorBaixa}`);

    // Se a coluna V (banco) for 13, trata-se de CAIXA
    if (banco === 13) {
      // Lançamento CAIXA – permanece na própria empresa (local conforme mapeamento)
      output.push(`${local};${dataBaixa};893;13;${valorBaixa};${historicoBase}`);
    } else if (banco) {
      // Caso seja um lançamento de BANCO (valor diferente de 13)
      if (empresa === "13") {
        // Se for Matriz (empresa "13")
        output.push(`${local};${dataBaixa};893;${banco};${valorBaixa};${historicoBase}`);
      } else if (empresa === "14" || empresa === "15") {
        // Se for Filial (empresa "14" ou "15")
        // Lançamento na própria filial:
        output.push(`${local};${dataBaixa};893;1516;${valorBaixa};${historicoBase}`);
        // Lançamento extra na Matriz:
        let extraAccount = "";
        if (empresa === "14") extraAccount = "1513";
        else if (empresa === "15") extraAccount = "5104";
        output.push(`0001;${dataBaixa};${extraAccount};${banco};${valorBaixa};${historicoBase}`);
      }
    }
  });

  console.log(`Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo328(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra328(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}

export {};