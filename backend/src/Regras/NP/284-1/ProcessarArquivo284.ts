import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

const machineToAccount = {
  'Getnet': '551',
  'Cielo': '538',
  'Stone': '545',
  'Bndes': '558',
  'Rede': '2060',
};

function normalizeText(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
}

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

export function transformData(rows: any[]): string[] {
  const output: string[] = [];

  rows.forEach((row, index) => {
    console.log(`Processando linha ${index + 1}:`, row);

    // Coluna A: tipoRelatório (deve ser "284/1" – assumido já filtrado)
    const tipoRelatorio = row[1];
    // Coluna B: empresa/local – aceitamos apenas "13", "14" ou "15"
    const filial = row[2] ? row[2].toString().trim() : "";
    if (!["13", "14", "15"].includes(filial)) {
      console.log(`Linha ${index + 1} ignorada: filial inválida (${filial}).`);
      return;
    }

    // Mapeamento do código local
    let local = "";
    if (filial === "13") local = "0001";
    else if (filial === "14") local = "0002";
    else if (filial === "15") local = "0003";

    // Coluna L: Nome da máquina (usado para mapear a conta, mas NÃO para o histórico)
    const maquina = row[12] ? row[12].toString().trim() : "";
    const normalizedMachine = maquina.toLowerCase();
    const contaMaquina = Object.entries(machineToAccount).find(([key]) =>
      normalizedMachine.includes(key.toLowerCase())
    )?.[1];
    if (!contaMaquina) {
      console.log(`Linha ${index + 1} ignorada: máquina inválida (${maquina}).`);
      return;
    }

    // Coluna R: Data da baixa (ignora horário)
    const dataBaixa = row[18] ? row[18].toString().split(' ')[0] : "";
    // Coluna S: Valor da baixa
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";
    // Coluna AG: Taxa administrativa
    const taxaAdministrativa = row[33] ? parseFloat(row[33]).toFixed(2) : "0.00";
    // Colunas G e I: informações para histórico
    const historicoG = row[7] ? normalizeText(row[7].toString().trim()) : "";
    const historicoI = row[9] ? normalizeText(row[9].toString().trim()) : "";
    // Monta o histórico SEM incluir o nome da máquina
    const historicoBase = `${normalizeText(maquina)} - ${historicoG} - ${historicoI}`.trim();
    // Coluna V: Banco
    const banco = row[22] ? row[22].toString().trim() : "";

    // Gerar os lançamentos de acordo com a regra:
    if (filial === "13") {
      // Matriz
      output.push(`${local};${dataBaixa};${banco};${contaMaquina};${valorBaixa};1189;${historicoBase}`);
      output.push(`${local};${dataBaixa};1325;${contaMaquina};${taxaAdministrativa};1360;${historicoBase}`);
    } else if (filial === "14" || filial === "15") {
      // Filial
      output.push(`${local};${dataBaixa};1514;${contaMaquina};${valorBaixa};1189;${historicoBase}`);
      output.push(`${local};${dataBaixa};1325;${contaMaquina};${taxaAdministrativa};1360;${historicoBase}`);
      // Lançamento extra – Dentro da Matriz (local fixo "0001")
      let extraAccount = "";
      if (filial === "14") extraAccount = "1513";
      else if (filial === "15") extraAccount = "5104";
      output.push(`0001;${dataBaixa};${banco};${extraAccount};${valorBaixa};1189;${historicoBase}`);
    }
  });

  console.log(`Transformação completa. Total de linhas processadas: ${output.length}`);
  return output;
}

export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

export async function processarArquivo284(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados...');
    const transformedData = transformData(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('Processo concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
