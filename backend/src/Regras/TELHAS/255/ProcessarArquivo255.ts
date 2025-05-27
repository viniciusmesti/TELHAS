import * as fs from 'fs';
import { readExcelFile } from '../../../utils';
import { transformarRegra255 } from './transformarRegra255';

// Exporta os dados processados para um arquivo TXT.
export function exportToTxt(data: string[], outputPath: string): void {
  data.push('');
  const content = data.join('\r\n');
  fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
}

// Função principal que orquestra a leitura, transformação e exportação dos dados da Regra 255 para a empresa TELHAS.
export async function processarArquivo255(inputExcelPath: string, outputTxtPath: string): Promise<void> {
  try {
    console.log('Lendo o arquivo Excel...');
    const rows = await readExcelFile(inputExcelPath);
    console.log(`Total de linhas lidas: ${rows.length}`);

    console.log('Transformando os dados (Regra 255) para TELHAS...');
    const transformedData = transformarRegra255(rows);

    console.log('Exportando os dados para TXT...');
    exportToTxt(transformedData, outputTxtPath);

    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Erro ao processar o arquivo.');
  }
}
