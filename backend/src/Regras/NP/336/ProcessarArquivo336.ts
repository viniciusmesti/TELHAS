import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Função para remover acentos e normalizar texto
function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Função para ler o arquivo Excel
export async function readExcelFile(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    
    console.log("Planilhas disponíveis:", workbook.worksheets.map(sheet => sheet.name));
    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            rows.push(row.values);
        }
    });

    console.log(`Total de linhas lidas: ${rows.length}`);
    return rows;
}

// Processamento da regra 336 para N&P - COMPENSAÇÃO DE CLIENTES
export function processarRegra336(rows: any[]): string[] {
    const output: string[] = [];

    rows.forEach((row, index) => {
        // Verifica se o código do relatório é 336 (coluna A – índice 1)
        const codigoRelatorio = Number(row[1]);
        if (codigoRelatorio !== 336) return;

        // A coluna B (índice 2) deverá conter "13", "14" ou "15"
        const filial = row[2] ? row[2].toString().trim() : "";
        if (!["13", "14", "15"].includes(filial)) return;
        let local = "";
        if (filial === "13") local = "0001";
        else if (filial === "14") local = "0002";
        else if (filial === "15") local = "0003";

        // Cliente (CNPJ) – coluna H (índice 8)
        const cnpjCliente = row[8] ? normalizeText(row[8].toString()) : "CNPJ_CLIENTE";
        // Informações para histórico – colunas G (índice 7) e I (índice 9)
        const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : "HIST_G";
        const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : "HIST_I";
        const historicoBase = `${historicoI} - ${historicoG}`.trim();

        // Data da baixa – coluna R (índice 18) (ignorar horário)
        const dataBaixa = row[18] ? row[18].toString().split(" ")[0] : "DATA_INVALIDA";

        // Valores:
        // Valor Desdobramento – coluna O (índice 15)
        const valorDesdobramento = row[15] ? parseFloat(row[15]).toFixed(2) : "0.00";
        // Juros Recebidos – soma de colunas AD (índice 30) e AF (índice 32)
        const jurosRecebidos = (parseFloat(row[30] || 0) + parseFloat(row[32] || 0)).toFixed(2);
        // Desconto – coluna AC (índice 29)
        const desconto = parseFloat(row[29] || 0).toFixed(2);
        // Multa – coluna AE (índice 31)
        const multa = parseFloat(row[31] || 0).toFixed(2);

        // Lançamento 1: Adiantamento de Cliente
        if (parseFloat(valorDesdobramento) > 0) {
            // D = 893; C = Cliente (CNPJ, coluna H); Hist. = 2081; Valor = coluna O; Data = coluna R
            output.push(`${local};${dataBaixa};893;${cnpjCliente};${valorDesdobramento};2081;${historicoBase}`);
        }
        // Lançamento 2: Juros Recebidos
        if (parseFloat(jurosRecebidos) > 0) {
            // D = 893; C = 1120; Hist. = 1202; Valor = AD + AF; Data = coluna R
            output.push(`${local};${dataBaixa};893;1120;${jurosRecebidos};1202;${historicoBase}`);
        }
        // Lançamento 3: Desconto
        if (parseFloat(desconto) > 0) {
            // D = 1377; C = 893; Hist. = 2082; Valor = coluna AC; Data = coluna R
            output.push(`${local};${dataBaixa};1377;893;${desconto};2082;${historicoBase}`);
        }
        // Lançamento 4: Multa
        if (parseFloat(multa) > 0) {
            // D = 893; C = 1112; Hist. = 1997; Valor = coluna AE; Data = coluna R
            output.push(`${local};${dataBaixa};893;1112;${multa};1997;${historicoBase}`);
        }
    });

    console.log(`Total de linhas processadas: ${output.length}`);
    return output;
}

// Exportar os dados para TXT
export function exportToTxt(data: string[], outputPath: string): void {
    if (data.length === 0) {
        console.log("Nenhuma linha foi processada. O arquivo TXT não será gerado.");
        return;
    }
    data.push('');
    const content = data.join('\r\n');
    fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
    console.log(`Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

// Função principal para processar o arquivo
export async function processarArquivo336(inputExcelPath: string, outputTxtPath: string): Promise<void> {
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
