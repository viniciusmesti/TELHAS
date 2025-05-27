import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as unorm from 'unorm';

/**
 * Remove acentos de uma string.
 */
export function removeAcentos(str: string): string {
  if (!str) return '';
  return unorm.nfd(str).replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza o texto: remove acentos, espaços extras e retorna a string limpa.
 */
export function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Lê um arquivo Excel e retorna um array com as linhas (ignorando o cabeçalho).
 */
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

/**
 * Formata uma data ISO (yyyy-mm-dd) para o formato "dd/mm/yy".
 * Exemplo: "2024-10-17" → "17/10/24"
 */
export function formatDate(date: string): string {
  const parts = date.split('-');
  if (parts.length >= 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.slice(-2)}`;
  }
  return date;
}

/**
 * Exporta os dados para um arquivo TXT.
 */
export function exportToTxt(data: string[], outputPath: string): void {
  // Acrescenta uma linha vazia ao final para formatação
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}
