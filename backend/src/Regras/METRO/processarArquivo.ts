import * as xlsx from 'xlsx';
import * as fs from 'fs';

export function processarSalarioExcel(path: string) {
  const workbook = xlsx.readFile(path);
  const sheetName = workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json<any>(sheet, { raw: true, defval: '' });

  console.log('🔍 Primeiras linhas do arquivo:');
  console.log(data.slice(0, 10));

  const contabeis: string[] = [];
  const fiscais: string[] = [];

  let bancoAtual = '';
  let codigoBanco = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const bancoPossivel = obterTextoBanco(row);

    if (bancoPossivel) {
      console.log(
        `➡️ Possível banco detectado na linha ${i + 1}: "${bancoPossivel}"`,
      );
      const bancoDetectado = detectarBanco(bancoPossivel);
      if (bancoDetectado) {
        bancoAtual = bancoPossivel;
        codigoBanco = bancoDetectado;
        console.log(
          `✅ Banco detectado: "${bancoAtual}" → Código: ${codigoBanco}`,
        );
        continue; // linha de cabeçalho, passa para próxima
      }
    }

    const documento: string = row['Documento'] || '';
    const credor: string = row['Credor'] || '';
    const dataPagtoRaw: Date | string = row['Dt. pagto.'] || '';
    const valorPago: number = parseFloat(row['Vl. pg conta'] || '0');
    const desconto: number = parseFloat(row['Desconto'] || '0');

    const dataPagto = formatarData(dataPagtoRaw);
    const docNum = documento.match(/\d{2}\/\d{4}/)?.[0] || '';

    // ➡️ Regra SAL
    if (documento.toUpperCase().includes('SAL')) {
      console.log(
        `➡️ Processando SAL na linha ${i + 1}: Documento: "${documento}", Código Banco atual: "${codigoBanco}"`,
      );

      const historicoSAL = `${docNum} ${credor}`;
      const linhaContabil = `0001;${dataPagto};126;${codigoBanco};${valorPago.toFixed(2)};882;"${historicoSAL}"`;
      contabeis.push(linhaContabil);
      console.log(`✅ Linha CONTÁBIL SAL: ${linhaContabil}`);

      const linhaFiscal = `1;1;988;001;${dataPagto};${dataPagto};${docNum};${valorPago.toFixed(2)};0.00;821;109;${desconto.toFixed(2)};0.00`;
      fiscais.push(linhaFiscal);
      console.log(`✅ Linha FISCAL SAL: ${linhaFiscal}`);
    }

    // ➡️ Regra PLB.PLB
    if (documento.toUpperCase().includes('PLB.PLB')) {
      console.log(
        `➡️ Processando PLB.PLB na linha ${i + 1}: Documento: "${documento}", Código Banco atual: "${codigoBanco}"`,
      );

      const historicoPLB = `${documento} ${credor}`;

      const linhaContabil = `0001;${dataPagto};127;${codigoBanco};${valorPago.toFixed(2)};882;"${historicoPLB}"`;
      contabeis.push(linhaContabil);
      console.log(`✅ Linha CONTÁBIL PLB: ${linhaContabil}`);
    }
  }

  console.log(`\n✅ Total de linhas CONTÁBEIS: ${contabeis.length}`);
  console.log(`✅ Total de linhas FISCAIS: ${fiscais.length}`);

  return { contabeis, fiscais };
}

export function exportarTxt(linhas: string[], outputPath: string) {
  const conteudo = linhas.join('\n');
  fs.writeFileSync(outputPath, conteudo, 'utf8');
}

function formatarData(data: string | Date): string {
  if (!data) return '';

  if (typeof data === 'string') {
    return data;
  }

  const dt = new Date(data);
  const dia = String(dt.getDate()).padStart(2, '0');
  const mes = String(dt.getMonth() + 1).padStart(2, '0');
  const ano = String(dt.getFullYear());
  return `${dia}/${mes}/${ano}`;
}

function detectarBanco(texto: any): string | null {
  if (!texto) return null;

  const t = String(texto).trim().toUpperCase();

  if (t.includes('BANCO DO BRASIL')) {
    return '795';
  } else if (t.includes('CEF')) {
    return '2';
  } else if (t.includes('SICOOB')) {
    return '3';
  }

  return null;
}

function obterTextoBanco(row: any): string | null {
  if (row['Conta Corrente']) return row['Conta Corrente'];
  if (row['Cd. cred.']) return row['Cd. cred.'];
  return null;
}
