import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para remover acentos e espaços desnecessários
function normalizeText(str: any): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Função para ler o arquivo Excel
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
    console.error("❌ Nenhuma planilha encontrada no arquivo.");
    throw new Error("Nenhuma planilha encontrada no arquivo.");
  }

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  console.log(`✅ Total de linhas lidas: ${rows.length}`);
  return rows;
}

// Processamento da Regra 347 para N&P – REAPRESENTAÇÃO CHD
export function processarRegra347(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    // Verifica se o código do relatório é 347 (coluna A - índice 1)
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 347) return;

    // Obtenha o código de local a partir da coluna B (índice 2) como string
    const codLocal = row[2] ? row[2].toString().trim() : "";
    // Determine a situação com base no valor:
    // Situação 1: "13", "14", "15"
    // Situação 2: "513", "514", "515"
    let grupo = 0;
    if (["13", "14", "15"].includes(codLocal)) {
      grupo = 1;
    } else if (["513", "514", "515"].includes(codLocal)) {
      grupo = 2;
    } else {
      // Ignora registros com outros valores
      return;
    }

    // Mapeamento do local (primeiro campo da saída)
    let local = "";
    if (grupo === 1) {
      if (codLocal === "13") local = "0001";
      else if (codLocal === "14") local = "0002";
      else if (codLocal === "15") local = "0003";
    } else if (grupo === 2) {
      if (codLocal === "513") local = "0001";
      else if (codLocal === "514") local = "0002";
      else if (codLocal === "515") local = "0003";
    }

    // Obtenha os demais campos:
    // BANCO – coluna V (índice 22)
    const banco = row[22] ? row[22].toString().trim() : "";
    // Data da baixa – coluna R (índice 18): pega somente a data
    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";
    // Valor – coluna S (índice 19)
    const valor = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";
    if (parseFloat(valor) <= 0) return;

    // Histórico: utiliza colunas G (índice 7), I (índice 9) e AH (índice 34)
    const historicoG = row[7] ? normalizeText(row[7].toString()) : "HIST_G";
    const historicoI = row[9] ? normalizeText(row[9].toString()) : "HIST_I";
    const historicoAH = row[34] ? normalizeText(row[34].toString()) : "HIST_AH";
    // Insere uma "/" entre a coluna I e a coluna AH
    const historicoBase = `3007;${historicoG} - ${historicoI} - ${historicoAH}`;

    // Processa de acordo com a situação:
    if (grupo === 1) {
      // 1º SITUAÇÃO (coluna B: "13", "14" ou "15")
      if (codLocal === "13") {
        // Matriz – Empresa 13
        // D = BANCO, C = 1483
        output.push(`${local};${dataBaixa};${banco};1483;${valor};${historicoBase}`);
      } else if (codLocal === "14" || codLocal === "15") {
        // Filial – Empresa 14/15
        // Lançamento na filial: D = 1514, C = 1483
        output.push(`${local};${dataBaixa};1514;1483;${valor};${historicoBase}`);
        // Lançamento extra na matriz:
        // Local fixo = "0001"
        // D = BANCO, C = (se "14" → 1513; se "15" → 5104)
        let extraAccount = "";
        if (codLocal === "14") extraAccount = "1513";
        else if (codLocal === "15") extraAccount = "5104";
        output.push(`0001;${dataBaixa};${banco};${extraAccount};${valor};${historicoBase}`);
      }
    } else if (grupo === 2) {
      // 2º SITUAÇÃO (coluna B: "513", "514" ou "515")
      if (codLocal === "513") {
        // Matriz – Empresa 513
        // D = BANCO, C = 893
        output.push(`${local};${dataBaixa};${banco};893;${valor};${historicoBase}`);
      } else if (codLocal === "514" || codLocal === "515") {
        // Filial – Empresa 514/515
        // Lançamento na filial: D = 1514, C = 893
        output.push(`${local};${dataBaixa};1514;893;${valor};${historicoBase}`);
        // Lançamento extra na matriz:
        // Local fixo = "0001"
        // D = BANCO, C = (se "514" → 1513; se "515" → 5104)
        let extraAccount = "";
        if (codLocal === "514") extraAccount = "1513";
        else if (codLocal === "515") extraAccount = "5104";
        output.push(`0001;${dataBaixa};${banco};${extraAccount};${valor};${historicoBase}`);
      }
    }
  });

  console.log(`✅ Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log("❌ Nenhuma linha foi processada. Arquivo TXT não será gerado.");
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`✅ Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

export async function processarArquivo347(inputExcelPath: string, outputTxtPath: string): Promise<void> {
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
