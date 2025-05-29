import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Mapeamento dos locais (filiais)
const LOCAL_MATRIZ = '0001';
const LOCAL_FILIAL_2 = '0002';
const LOCAL_FILIAL_3 = '0003';

// Contas contábeis fixas
const CONTA_CHEQUES_RECEBER = '1483';
const CONTA_C_C_MATRIZ = '1514';
const CONTA_ADIANTAMENTO_CLIENTE = '893';
const CONTA_BANCO_FILIAL_2 = '1515';
const CONTA_BANCO_FILIAL_3 = '5105';

// Tipo de relatório que será processado
const TIPO_RELATORIO_PROCESSAR = '257/1';

/**
 * Remove acentos de uma string utilizando normalização Unicode.
 */
function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Lê um arquivo Excel e retorna os dados (pulando o cabeçalho).
 */
export async function readExcelFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // Ignora o cabeçalho (primeira linha)
    if (rowNumber > 1) {
      rows.push(row.values);
    }
  });

  return rows;
}

/**
 * Processa uma única linha do Excel e retorna um array de linhas formatadas
 * conforme as regras da empresa.
 */
function processRow(row: any[], rowIndex: number): string[] {
  const outputLines: string[] = [];

  // Extração e formatação dos dados da linha
  const tipoRelatorio = row[1]?.toString().trim();
  if (tipoRelatorio !== TIPO_RELATORIO_PROCESSAR) {
    console.log(
      `Linha ${rowIndex + 1} ignorada: não corresponde ao tipo ${TIPO_RELATORIO_PROCESSAR}.`,
    );
    return outputLines;
  }

  const empresa = parseInt(row[2]);
  const banco = row[22]?.toString() || '';
  const nomeCliente = row[7] ? normalizeText(row[7].toString().trim()) : '';
  const docNumero = row[9] ? normalizeText(row[9].toString().trim()) : '';
  const valorBaixa = parseFloat(row[19] || '0').toFixed(2);
  const dataBaixa = row[14]?.split(' ')[0] || '';
  const historico = `1193;${nomeCliente}${docNumero ? ' - ' + docNumero : ''}`;

  let linhaPrincipal = '';

  switch (empresa) {
    case 13: // Matriz - LONDRINA
      linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_CHEQUES_RECEBER};${valorBaixa};${historico}`;
      break;

    case 14: // Filial 2 – PRUDENTE
      // Linha extra para o lançamento na filial
      outputLines.push(
        `${LOCAL_FILIAL_2};${dataBaixa};${CONTA_C_C_MATRIZ};${CONTA_CHEQUES_RECEBER};${valorBaixa};${historico}`,
      );
      linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_BANCO_FILIAL_2};${valorBaixa};${historico}`;
      break;

    case 15: // Filial 3 - UMUARAMA
      outputLines.push(
        `${LOCAL_FILIAL_3};${dataBaixa};${CONTA_C_C_MATRIZ};${CONTA_CHEQUES_RECEBER};${valorBaixa};${historico}`,
      );
      linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_BANCO_FILIAL_3};${valorBaixa};${historico}`;
      break;

    case 513: // Empresa 513 (lançamento dentro da matriz)
      linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_ADIANTAMENTO_CLIENTE};${valorBaixa};${historico}`;
      break;

    case 514: // Empresa 514 (Filial 2)
      outputLines.push(
        `${LOCAL_FILIAL_2};${dataBaixa};${CONTA_C_C_MATRIZ};${CONTA_ADIANTAMENTO_CLIENTE};${valorBaixa};${historico}`,
      );
      linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_BANCO_FILIAL_2};${valorBaixa};${historico}`;
      break;

    case 515: // Empresa 515 (Filial 3)
      outputLines.push(
        `${LOCAL_FILIAL_3};${dataBaixa};${CONTA_C_C_MATRIZ};${CONTA_ADIANTAMENTO_CLIENTE};${valorBaixa};${historico}`,
      );
      linhaPrincipal = `${LOCAL_MATRIZ};${dataBaixa};${banco};${CONTA_BANCO_FILIAL_3};${valorBaixa};${historico}`;
      break;

    default:
      console.log(
        `Linha ${rowIndex + 1} ignorada: Empresa ${empresa} não reconhecida.`,
      );
      return outputLines;
  }

  if (linhaPrincipal) {
    outputLines.push(linhaPrincipal);
    console.log(`Linha adicionada (linha ${rowIndex + 1}): ${linhaPrincipal}`);
  }

  return outputLines;
}

/**
 * Processa todas as linhas lidas do Excel aplicando as regras de transformação.
 */
export function transformData(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);
    const linhasProcessadas = processRow(row, index);
    output.push(...linhasProcessadas);
  });

  console.log(
    `Transformação concluída. Total de linhas processadas: ${output.length}`,
  );
  return output;
}

/**
 * Exporta os dados processados para um arquivo TXT.
 */
export function exportToTxt(data: string[], outputPath: string): void {
  // Adiciona uma linha vazia no final (opcional)
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

/**
 * Função principal que orquestra a leitura, transformação e exportação dos dados.
 */
export async function processarArquivos257_1(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados...');
    const transformedData = transformData(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('✅ Processo concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
