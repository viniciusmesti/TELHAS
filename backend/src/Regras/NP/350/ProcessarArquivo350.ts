import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

// Mapeamento de histórico conforme as regras
const historicoMap: { [key: string]: string } = {
  APLICACAO: '444',
  RESGATE: '656',
  DEPOSITO: '466',
  TRANSFERENCIA: '609',
};

// Função para normalizar texto (remover acentos, espaços extras e caracteres especiais) e converter para maiúsculas
function normalizeText(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
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

// Função para processar os dados conforme a regra 350 – TRANSFERÊNCIA DINHEIRO - N&P
export function processarRegra350(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    // Verifica se o código do relatório é 350 (coluna A – índice 1)
    const codigoRelatorio = Number(row[1]);
    if (codigoRelatorio !== 350) return;

    // Obter o valor da coluna B (índice 2) como string; os valores aceitos são "13", "14" ou "15"
    const filial = row[2] ? row[2].toString().trim() : '';
    if (!['13', '14', '15'].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada - Filial inválida: ${filial}`);
      return;
    }

    // Para ambos os casos, a data e o valor vêm das colunas D e F, respectivamente:
    const dataBaixa = row[4]
      ? row[4].toString().split(' ')[0]
      : 'DATA_INVALIDA';
    const valorBaixa = row[6] ? parseFloat(row[6]).toFixed(2) : '0.00';
    if (parseFloat(valorBaixa) <= 0) return;

    // Para identificar o tipo de operação, usamos a coluna E (índice 5)
    const historicoReferencia = row[5]
      ? normalizeText(row[5].toString().trim())
      : '';

    // Se o registro for da Matriz (filial "13")
    if (filial === '13') {
      // Usamos o mapeamento para definir o histórico – pode ser "444", "656", "466" ou "609"
      const hist = historicoMap[historicoReferencia];
      if (!hist) {
        console.log(
          `Linha ${index + 1} ignorada - Histórico inválido: ${historicoReferencia}`,
        );
        return;
      }
      // Conta de débito: da coluna J (índice 10)
      const contaDebito = row[10] ? row[10].toString().trim() : '';
      // Conta de crédito: da coluna H (índice 8)
      const contaCredito = row[8] ? row[8].toString().trim() : '';

      // Lançamento na Matriz: local fixo "0001", D = contaDebito (coluna J), C = contaCredito (coluna H)
      output.push(
        `0001;${dataBaixa};${contaDebito};${contaCredito};${valorBaixa};${hist}`,
      );
    } else if (filial === '14' || filial === '15') {
      // Para transferências das filiais, apenas serão processados se a operação for DEPOSITO.
      // Verifica se o histórico informado é "DEPOSITO"
      if (historicoReferencia !== 'DEPOSITO') {
        console.log(
          `Linha ${index + 1} ignorada - Transferência em filial somente para DEPOSITO. Histórico: ${historicoReferencia}`,
        );
        return;
      }
      // Para depósitos, o histórico deve ser "466"
      const hist = '466';

      // Lançamento na Filial:
      // Local: "0002" se filial = "14", "0003" se filial = "15"
      const localFilial = filial === '14' ? '0002' : '0003';
      // Neste lançamento, as contas são fixas:
      // D = 1514 (C/C Matriz), C = 13 (Adiantamento de Cliente)
      output.push(`${localFilial};${dataBaixa};1514;13;${valorBaixa};${hist}`);

      // Lançamento extra na Matriz:
      // Local fixo: "0001"
      // D = conta informada na coluna J (índice 10)
      const contaDebitoExtra = row[10] ? row[10].toString().trim() : '';
      // C = conforme tabela: se filial "14" → 1513; se filial "15" → 5104
      const contaCreditoExtra = filial === '14' ? '1513' : '5104';
      output.push(
        `0001;${dataBaixa};${contaDebitoExtra};${contaCreditoExtra};${valorBaixa};${hist}`,
      );
    }
  });

  return output;
}

// Função para exportar os dados transformados para um arquivo TXT
export function exportToTxt(data: string[], outputPath: string): void {
  if (data.length === 0) {
    console.log('Nenhuma linha foi processada. O arquivo TXT não será gerado.');
    return;
  }
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
  console.log(`📂 Arquivo salvo com ${data.length} linhas em: ${outputPath}`);
}

// Função principal para processar o arquivo de entrada e gerar a saída
export async function processarArquivo350(
  inputExcelPath: string,
  outputTxtPath: string,
): Promise<void> {
  try {
    console.log('🚀 Iniciando processamento...');
    const rows = await readExcelFile(inputExcelPath);
    const transformedData = processarRegra350(rows);
    exportToTxt(transformedData, outputTxtPath);
    console.log('✅ Processamento concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
