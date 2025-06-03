// src/Regras/METRO/processarArquivo.ts

import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export interface ResultadoSalario {
  contabeis: string[];
  fiscais: string[];
}

export function processarSalarioExcel(inputPath: string): ResultadoSalario {
  // 1) Carrega o arquivo principal (ex: "01 2025.xlsx")
  const workbook = xlsx.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json<any>(sheet, { raw: true, defval: '' });

  console.log('🔍 Primeiras linhas do arquivo principal (“01 2025.xlsx”):');
  console.table(data.slice(0, 10));

  // 2) Monta o caminho para o arquivo de exportação (“Exportacao.xlsx”) na mesma pasta do principal
  const dirPrincipal = path.dirname(inputPath);
  const exportPath = path.join(dirPrincipal, 'Exportacao.xlsx');
  if (!fs.existsSync(exportPath)) {
    throw new Error(`Arquivo de exportação não encontrado em: ${exportPath}`);
  }

  // 3) Carrega o arquivo de exportação e transforma em um Map lookup pelo número da nota (NFE / NFSE / NFCA / NFCD)
  const exportWorkbook = xlsx.readFile(exportPath);
  const exportSheetName = exportWorkbook.SheetNames[0];
  const exportSheet = exportWorkbook.Sheets[exportSheetName];
  const exportData: any[][] = xlsx.utils.sheet_to_json(exportSheet, { header: 1, defval: '' });

  interface ExportInfo {
    chaveDuplicata: string;
    clienteFornecedor: string;
  }
  const mapaExportacao: Record<string, ExportInfo> = {};

  // Presume-se que a primeira linha de exportData seja header, então iniciamos em index 1
  for (let i = 1; i < exportData.length; i++) {
    const row = exportData[i];
    // row[0] = Coluna A; row[2] = Coluna C; row[6] = Coluna G
    const chaveDuplicata = String(row[0] || '').trim();
    const numeroNotaRaw = String(row[2] || '').trim();
    const clienteFornecedor = String(row[6] || '').trim();

    if (!numeroNotaRaw) continue;
    const numeroNota = numeroNotaRaw.replace(/\s+/g, '');
    mapaExportacao[numeroNota] = { chaveDuplicata, clienteFornecedor };
  }

  console.log('🔍 Mapa de exportação carregado (númeroNota → {chaveDuplicata, clienteFornecedor}):');
  console.log(mapaExportacao);

  // Arrays de saída final
  const contabeis: string[] = [];
  const fiscais: string[] = [];

  let codigoBanco = ''; // vai sendo atualizado a cada linha de cabeçalho de banco

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // ========== 1) DETECTA CABEÇALHO DE BANCO ==========
    const possivelBanco = row['Conta Corrente'] || row['Cd. cred.'] || '';
    if (possivelBanco) {
      const codigo = detectarBanco(possivelBanco);
      if (codigo) {
        codigoBanco = codigo;
        console.log(`✅ Banco detectado (linha ${i + 1}): "${possivelBanco.trim()}" → Código ${codigoBanco}`);
        continue; // pula para a próxima linha, sem gerar contábil/fiscal
      }
    }

    // ========== 2) EXTRAI CAMPOS BÁSICOS DA LINHA ==========
    const documentoRaw = String(row['Documento'] || '');
    const documento = documentoRaw.trim().toUpperCase();
    const credor = String(row['Credor'] || '').trim();
    const dataPagtoRaw = row['Dt. pagto.'];
    const valorPago = Number(row['Vl. pg conta']) || 0;
    const desconto = Number(row['Desconto']) || 0;
    const dataPagto = formatarData(dataPagtoRaw);
    const docNum = documento.match(/\d{2}\/\d{4}/)?.[0] ?? '';

    console.log(
      `\n📋 Linha ${i + 1}: Documento="${documentoRaw}", Credor="${credor}", Data="${dataPagto}", Valor="${valorPago.toFixed(2)}"`
    );

    // ========== 3) REGRAS DE SAÍDA CONTÁBIL ==========

    if (documento.includes('SAL')) {
      // SAL
      const historico = `${docNum} ${credor}`;
      const linhaContabil = `0001;${dataPagto};126;${codigoBanco};${valorPago.toFixed(2)};882;"${historico}"`;
      contabeis.push(linhaContabil);
      console.log(`✅ CONTÁBIL SAL: ${linhaContabil}`);

    } else if (documento.includes('PLB.PLB')) {
      // PLB.PLB
      const historico = `${documentoRaw} ${credor}`;
      const linhaContabil = `0001;${dataPagto};127;${codigoBanco};${valorPago.toFixed(2)};882;"${historico}"`;
      contabeis.push(linhaContabil);
      console.log(`✅ CONTÁBIL PLB.PLB: ${linhaContabil}`);

    } else if (documento.startsWith('AV.')) {
      // TARIFA
      const linhaTarifa = `0001;${dataPagto};253;${codigoBanco};${valorPago.toFixed(2)};445;""`;
      contabeis.push(linhaTarifa);
      console.log(`✅ CONTÁBIL TARIFA: ${linhaTarifa}`);

    } else if (documento.startsWith('TRCT.RESCISAO')) {
      // TRCT.RESCISAO - Rescisão trabalhista
      const historicoA = String(row['Coluna A'] || credor).trim();
      const linhaRecisao = `0001;${dataPagto};8224;${codigoBanco};${valorPago.toFixed(2)};401;"${historicoA}"`;
      contabeis.push(linhaRecisao);
      console.log(`✅ CONTÁBIL RECISÃO: ${linhaRecisao}`);

    } else if (documento.startsWith('ADT.')) {
      // ADT - Adiantamento
      const historico = `${docNum} ${credor}`;
      const linhaAdt = `0001;${dataPagto};30;${codigoBanco};${valorPago.toFixed(2)};820;"${historico}"`;
      contabeis.push(linhaAdt);
      console.log(`✅ CONTÁBIL ADT: ${linhaAdt}`);

    } else if (documento.startsWith('GRRF.FGTS')) {
      // GRRF.FGTS - FGTS Rescisão
      const historicoA = credor;
      const linhaGrrf = `0001;${dataPagto};8112;${codigoBanco};${valorPago.toFixed(2)};383;"${historicoA}"`;
      contabeis.push(linhaGrrf);
      console.log(`✅ CONTÁBIL GRRF.FGTS: ${linhaGrrf}`);

    } else {
      console.log(`⚠️ Ignorado Contábil: ${documentoRaw}`);
    }

    // ========== 4) REGRA FISCAL NFE ==========

    if (documento.startsWith('NFE.')) {
      const partes = documentoRaw.split('.');
      const numeroNfe = partes.length > 1 ? partes[1].trim() : '';
      const info = mapaExportacao[numeroNfe];

      if (info) {
        const valorStr = valorPago.toFixed(2);
        const descontoStr = desconto.toFixed(2);
        const linhaFiscalNfe = [
          '1',
          '1',
          info.chaveDuplicata,
          '001',
          dataPagto,
          dataPagto,
          numeroNfe,
          valorStr,
          '0.00',
          '821',
          info.clienteFornecedor,
          descontoStr,
          '0.00',
        ].join(';');

        fiscais.push(linhaFiscalNfe);
        console.log(`✅ FISCAL NFE: ${linhaFiscalNfe}`);
      } else {
        console.warn(`⚠️ NFE ${numeroNfe} não encontrada em Exportacao.xlsx → descartando.`);
      }
    }

    // ========== 5) REGRA FISCAL NFSE ==========

    if (documento.startsWith('NFSE.')) {
      const partes = documentoRaw.split('.');
      const numeroNfse = partes.length > 1 ? partes[1].trim() : '';
      const info = mapaExportacao[numeroNfse];

      if (info) {
        const valorStr = valorPago.toFixed(2);
        const descontoStr = desconto.toFixed(2);
        const linhaFiscalNfse = [
          '1',
          '1',
          info.chaveDuplicata,
          '001',
          dataPagto,
          dataPagto,
          numeroNfse,
          valorStr,
          '0.00',
          '821',
          info.clienteFornecedor,
          descontoStr,
          '0.00',
        ].join(';');

        fiscais.push(linhaFiscalNfse);
        console.log(`✅ FISCAL NFSE: ${linhaFiscalNfse}`);
      } else {
        console.warn(`⚠️ NFSE ${numeroNfse} não encontrada em Exportacao.xlsx → descartando.`);
      }
    }

    // ========== 6) REGRA FISCAL NFCA ==========

    if (documento.startsWith('NFCA.')) {
      const partes = documentoRaw.split('.');
      const numeroNfca = partes.length > 1 ? partes[1].trim() : '';
      const info = mapaExportacao[numeroNfca];

      if (info) {
        const valorStr = valorPago.toFixed(2);
        const descontoStr = desconto.toFixed(2);
        const linhaFiscalNfca = [
          '1',
          '1',
          info.chaveDuplicata,
          '001',
          dataPagto,
          dataPagto,
          numeroNfca,
          valorStr,
          '0.00',
          '821',
          info.clienteFornecedor,
          descontoStr,
          '0.00',
        ].join(';');

        fiscais.push(linhaFiscalNfca);
        console.log(`✅ FISCAL NFCA: ${linhaFiscalNfca}`);
      } else {
        console.warn(`⚠️ NFCA ${numeroNfca} não encontrada em Exportacao.xlsx → descartando.`);
      }
    }

    // ========== 7) REGRA FISCAL NFCD ==========

    if (documento.startsWith('NFCD.')) {
      const partes = documentoRaw.split('.');
      const numeroNfcd = partes.length > 1 ? partes[1].trim() : '';
      const info = mapaExportacao[numeroNfcd];

      if (info) {
        const valorStr = valorPago.toFixed(2);
        const descontoStr = desconto.toFixed(2);
        const linhaFiscalNfcd = [
          '1',
          '1',
          info.chaveDuplicata,
          '001',
          dataPagto,
          dataPagto,
          numeroNfcd,
          valorStr,
          '0.00',
          '821',
          info.clienteFornecedor,
          descontoStr,
          '0.00',
        ].join(';');

        fiscais.push(linhaFiscalNfcd);
        console.log(`✅ FISCAL NFCD: ${linhaFiscalNfcd}`);
      } else {
        console.warn(`⚠️ NFCD ${numeroNfcd} não encontrada em Exportacao.xlsx → descartando.`);
      }
    }
  }

  console.log(`\n🔢 Totais → CONTÁBEIS: ${contabeis.length}, FISCAIS: ${fiscais.length}`);
  console.log('📝 Última linha contábil:', contabeis[contabeis.length - 1] || 'nenhuma');
  console.log('📝 Última linha fiscal:', fiscais[fiscais.length - 1] || 'nenhuma');

  return { contabeis, fiscais };
}

export function exportarTxt(linhas: string[], outputPath: string): void {
  const conteudo = linhas.join('\n') + '\n';
  try {
    fs.writeFileSync(outputPath, conteudo, 'utf8');
    const count = fs
      .readFileSync(outputPath, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l)
      .length;
    console.log(`💾 Escritas ${count} linhas em ${outputPath}`);
  } catch (err) {
    console.error('❌ Erro ao escrever arquivo:', err);
  }
}

function formatarData(data: string | Date): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  const dt = new Date(data);
  const d = String(dt.getDate()).padStart(2, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const y = String(dt.getFullYear());
  return `${d}/${m}/${y}`;
}

function detectarBanco(texto: any): string | null {
  if (!texto) return null;
  const t = String(texto).trim().toUpperCase();
  if (t.includes('BANCO DO BRASIL')) return '795';
  if (t.includes('CEF')) return '2';
  if (t.includes('SICOOB')) return '3';
  return null;
}
