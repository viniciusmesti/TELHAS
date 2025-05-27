import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para remover acentos e espaços desnecessários
function normalizeText(str: any): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

export function processarRegra337(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    // Verifica se o código do relatório é 337 (coluna A – índice 1)
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 337) return;

    // Agora usamos a coluna B (índice 2) para identificar o local
    const filial = row[2] ? row[2].toString().trim() : "";
    if (!["13", "14", "15"].includes(filial)) return;
    
    let local = "";
    if (filial === "13") local = "0001";
    else if (filial === "14") local = "0002";
    else if (filial === "15") local = "0003";

    // Cliente (CNPJ ou CPF) – coluna H (índice 8)
    let cnpjCliente = row[8] ? row[8].toString().trim() : "CNPJ_CLIENTE";
    cnpjCliente = cnpjCliente.replace(/\s+/g, ''); // Remove espaços extras

    // Histórico: 2082 concatenado com as informações das colunas G (índice 7) e I (índice 9)
    const historicoG = normalizeText(row[7] ? row[7].toString() : "HIST_G");
    const historicoI = normalizeText(row[9] ? row[9].toString() : "HIST_I");
    const historicoBase = `2082;${historicoG} - ${historicoI}`;

    // Data da baixa – coluna R (índice 18), ignorando o horário
    const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";
    // Valor – coluna O (índice 15)
    const valor = row[15] ? parseFloat(row[15]).toFixed(2) : "0.00";

    // Gera o lançamento somente se o valor for maior que zero
    if (parseFloat(valor) <= 0) return;

    output.push(`${local};${dataBaixa};1377;${cnpjCliente};${valor};${historicoBase}`);


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

export async function processarArquivo337(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra337(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('🎉 Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error.message);
    throw new Error('Erro ao processar o arquivo.');
  }
}
