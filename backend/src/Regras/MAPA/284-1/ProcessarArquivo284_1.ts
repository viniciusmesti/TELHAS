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
    const tipoRelatorio = row[1];
    const empresa = row[2]?.toString().trim();

    if (!["6", "9"].includes(empresa)) {
      console.log(`Linha ${index + 1} ignorada: empresa inválida (${empresa}).`);
      return;
    }

    const local = empresa === "6" ? "0001" : "0002";

    const maquina = row[12]?.toString().trim() || "";
    const normalizedMachine = maquina.toLowerCase();
    const contaMaquina = Object.entries(machineToAccount).find(([key]) =>
      normalizedMachine.includes(key.toLowerCase())
    )?.[1];

    if (!contaMaquina) {
      console.log(`Linha ${index + 1} ignorada: máquina inválida (${maquina}).`);
      return;
    }

    const dataBaixa = row[18]?.toString().split(" ")[0] || "";
    const valorBaixa = row[19] ? parseFloat(row[19]).toFixed(2) : "0.00";
    const taxaAdm = row[33] ? parseFloat(row[33]).toFixed(2) : "0.00";
    const banco = row[22]?.toString().trim() || "";

    const g = row[7] ? normalizeText(row[7].toString().trim()) : "";
    const i = row[9] ? normalizeText(row[9].toString().trim()) : "";
    const histBase = `${normalizeText(maquina)} - ${g} - ${i}`.trim();

    if (empresa === "6") {
      // MATRIZ
      output.push(`${local};${dataBaixa};${banco};${contaMaquina};${valorBaixa};1189;${histBase}`);
      output.push(`${local};${dataBaixa};1325;${contaMaquina};${taxaAdm};1360;${histBase}`);
    } else if (empresa === "9") {
      // FILIAL
      output.push(`${local};${dataBaixa};1514;${contaMaquina};${valorBaixa};1189;${histBase}`);
      output.push(`${local};${dataBaixa};1325;${contaMaquina};${taxaAdm};1360;${histBase}`);

      // EXTRA NA MATRIZ
      output.push(`0001;${dataBaixa};${banco};1515;${valorBaixa};1189;${histBase}`);
    }
  });

  console.log(`Transformação concluída. Total de linhas: ${output.length}`);
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
