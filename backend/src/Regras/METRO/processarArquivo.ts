import * as xlsx from 'xlsx';
import * as fs from 'fs';

export interface ResultadoSalario {
  contabeis: string[];
  fiscais: string[];
}

export function processarSalarioExcel(path: string): ResultadoSalario {
  const workbook = xlsx.readFile(path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json<any>(sheet, { raw: true, defval: '' });

  console.log('🔍 Primeiras linhas do arquivo:');
  console.table(data.slice(0, 10));

  const contabeis: string[] = [];
  const fiscais: string[] = [];

  let bancoAtual = '';
  let codigoBanco = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Detecção de cabeçalho de banco
    const bancoPossivel = obterTextoBanco(row);
    if (bancoPossivel) {
      console.log(`➡️ Possível banco detectado na linha ${i + 1}: "${bancoPossivel}"`);
      const bancoDetectado = detectarBanco(bancoPossivel);
      if (bancoDetectado) {
        bancoAtual = bancoPossivel.trim();
        codigoBanco = bancoDetectado;
        console.log(`✅ Banco detectado: "${bancoAtual}" → Código: ${codigoBanco}`);
        continue; // pula cabeçalho de banco
      }
    }

    // Extração e normalização de campos
    const documentoRaw = String(row['Documento'] || '');
    const documento = documentoRaw.trim().toUpperCase();
    const credor = String(row['Credor'] || '').trim();
    const dataPagtoRaw = row['Dt. pagto.'];
    const valorPago = Number(row['Vl. pg conta']) || 0;
    const desconto = Number(row['Desconto']) || 0;

    const dataPagto = formatarData(dataPagtoRaw);
    const docNum = documento.match(/\d{2}\/\d{4}/)?.[0] ?? '';

    console.log(`\n📋 Linha ${i + 1}: Documento="${documentoRaw}", Credor="${credor}", DataPagto="${dataPagto}", Valor="${valorPago.toFixed(2)}", Desconto="${desconto.toFixed(2)}"`);

    // Regras de processamento
    if (documento.includes('SAL')) {
      // Regra SAL
      const historico = `${docNum} ${credor}`;
      const linhaContabil = `0001;${dataPagto};126;${codigoBanco};${valorPago.toFixed(2)};882;"${historico}"`;
      contabeis.push(linhaContabil);
      console.log(`✅ Linha CONTÁBIL SAL: ${linhaContabil}`);

      const linhaFiscal = `1;1;988;001;${dataPagto};${dataPagto};${docNum};${valorPago.toFixed(2)};0.00;821;109;${desconto.toFixed(2)};0.00`;
      fiscais.push(linhaFiscal);
      console.log(`✅ Linha FISCAL SAL: ${linhaFiscal}`);
    }
    else if (documento.includes('PLB.PLB')) {
      // Regra PLB.PLB
      const historico = `${documentoRaw} ${credor}`;
      const linhaContabil = `0001;${dataPagto};127;${codigoBanco};${valorPago.toFixed(2)};882;"${historico}"`;
      contabeis.push(linhaContabil);
      console.log(`✅ Linha CONTÁBIL PLB.PLB: ${linhaContabil}`);
    }
    else if (documento.startsWith('AV.')) {
      // Regra TARIFA
      const linhaTarifa = `0001;${dataPagto};253;${codigoBanco};${valorPago.toFixed(2)};445;""`;
      contabeis.push(linhaTarifa);
      console.log(`✅ Linha CONTÁBIL TARIFA: ${linhaTarifa}`);
    }
    else {
      console.log(`⚠️ Nenhuma regra aplicável para documento: "${documentoRaw}"`);
    }
  }

  console.log(`\n✅ Total de linhas CONTÁBEIS: ${contabeis.length}`);
  console.log(`✅ Total de linhas FISCAIS: ${fiscais.length}`);

  return { contabeis, fiscais };
}

export function exportarTxt(linhas: string[], outputPath: string): void {
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
  if (t.includes('BANCO DO BRASIL')) return '795';
  if (t.includes('CEF')) return '2';
  if (t.includes('SICOOB')) return '3';
  return null;
}

function obterTextoBanco(row: any): string | null {
  if (row['Conta Corrente']) return String(row['Conta Corrente']);
  if (row['Cd. cred.']) return String(row['Cd. cred.']);
  return null;
}
