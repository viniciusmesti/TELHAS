// ============================================================================
// CONFIGURAÇÕES E CONSTANTES ResultadoSalario 
// ============================================================================
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG = {
  COLUNAS: {
    CREDOR: 'Credor',
    CONTA_CREDITO: 'Cd. cred.',
    DOCUMENTO: 'Documento',
    DATA: 'Dt. pagto.',
    DESCONTO: 'Desconto',
    VALOR: 'Vl. pg conta',
  },
  BANCOS: {
    BANCO_DO_BRASIL: 'BANCO DO BRASIL',
    CEF: 'CEF',
    SICOOB: 'SICOOB',
  },
  CODIGOS_BANCOS: {
    BANCO_DO_BRASIL: '795',
    CEF: '2',
    SICOOB: '3',
  },
  MENSAGENS: {
    ARQUIVO_NAO_ENCONTRADO: (path: string) => `❌ Exportação não encontrada: ${path}`,
    BANCO_DETECTADO: (linha: number, banco: string, codigo: string) => `✅ Banco detectado (linha ${linha}): "${banco}" → Código ${codigo}`,
    CONTABIL_GERADA: (tipo: string, linha: string) => `✅ CONTÁBIL ${tipo}: ${linha}`,
    FISCAL_GERADA: (tipo: string, linha: string) => `✅ FISCAL ${tipo}: ${linha}`,
    FISCAL_DESCARTADA: (tipo: string, numero: string) => `⚠️ ${tipo} ${numero} não encontrada em Exportacao.xlsx → descartando.`,
  },
};

interface ExportInfo {
  chaveDuplicata: string;
  clienteFornecedor: string;
}

interface ResultadoSalario {
  contabeis: string[];
  fiscais: string[];
}

// ============================================================================
// FORMATADORES / UTILITÁRIOS
// ============================================================================
function formatarData(data: string | Date): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  const dt = new Date(data);
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${dt.getFullYear()}`;
}

function detectarBanco(texto: any): string | null {
  const raw = typeof texto === 'object' && texto !== null && 'v' in texto ? texto.v : texto;
  const upper = String(raw || '').toUpperCase().trim();
  if (upper.includes(CONFIG.BANCOS.BANCO_DO_BRASIL)) return CONFIG.CODIGOS_BANCOS.BANCO_DO_BRASIL;
  if (upper.includes(CONFIG.BANCOS.CEF)) return CONFIG.CODIGOS_BANCOS.CEF;
  if (upper.includes(CONFIG.BANCOS.SICOOB)) return CONFIG.CODIGOS_BANCOS.SICOOB;
  return null;
}

function gerarLinhaContabil(tipo: string, data: string, debito: string, credito: string, valor: number, historico: string): string {
  return `0001;${data};${debito};${credito};${valor.toFixed(2)};882;"${historico}"`;
}

function gerarLinhaFiscal(tipo: string, numero: string, data: string, valor: number, desconto: number, info: ExportInfo): string {
  return [
    '1',
    '1',
    info.chaveDuplicata,
    '001',
    data,
    data,
    numero,
    valor.toFixed(2),
    '0.00',
    '821',
    info.clienteFornecedor,
    desconto.toFixed(2),
    '0.00',
  ].join(';');
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE PROCESSAMENTO
// ============================================================================
export function processarSalarioExcel(
  pagamentosPath: string,
  exportacaoPath: string
): ResultadoSalario {
  const wb = xlsx.readFile(pagamentosPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json<any>(sheet, { defval: '' });

  if (!fs.existsSync(exportacaoPath)) {
    throw new Error(CONFIG.MENSAGENS.ARQUIVO_NAO_ENCONTRADO(exportacaoPath));
  }

  const exportSheet = xlsx.readFile(exportacaoPath).Sheets[xlsx.readFile(exportacaoPath).SheetNames[0]];
  const exportData = xlsx.utils.sheet_to_json<any[]>(exportSheet, { header: 1, defval: '' });

  const mapaExportacao: Record<string, ExportInfo> = {};
  for (let i = 1; i < exportData.length; i++) {
    const [chave, , numero, , , , cliente] = exportData[i];
    if (numero) {
      mapaExportacao[String(numero).replace(/\s+/g, '')] = {
        chaveDuplicata: String(chave).trim(),
        clienteFornecedor: String(cliente).trim(),
      };
    }
  }

  const contabeis: string[] = [];
  const fiscais: string[] = [];
  let codigoBanco = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const documento: string = String(row[CONFIG.COLUNAS.DOCUMENTO] || '').trim().toUpperCase();
    const dataPagto = formatarData(row[CONFIG.COLUNAS.DATA]);
    const valor = Number(row[CONFIG.COLUNAS.VALOR]) || 0;
    const desconto = Number(row[CONFIG.COLUNAS.DESCONTO]) || 0;
    const credor = String(row[CONFIG.COLUNAS.CREDOR] || '').trim();

    const bancoDetectado = row[CONFIG.COLUNAS.CONTA_CREDITO];
    const bancoCodigo = detectarBanco(bancoDetectado);
    if (bancoCodigo) {
      codigoBanco = bancoCodigo;
      console.log(CONFIG.MENSAGENS.BANCO_DETECTADO(i + 1, bancoDetectado, bancoCodigo));
      continue;
    }

    const docNum = documento.match(/\d{2}\/\d{4}/)?.[0] ?? '';
    if (documento.includes('SAL')) {
      const linha = gerarLinhaContabil('SAL', dataPagto, '126', codigoBanco, valor, `${docNum} ${credor}`);
      contabeis.push(linha);
      console.log(CONFIG.MENSAGENS.CONTABIL_GERADA('SAL', linha));
    } else if (documento.startsWith('NF')) {
      const partes = documento.split('.');
      const numero = partes[1]?.trim();
      const tipo = partes[0];
      const info = mapaExportacao[numero];
      if (info) {
        const linha = gerarLinhaFiscal(tipo, numero, dataPagto, valor, desconto, info);
        fiscais.push(linha);
        console.log(CONFIG.MENSAGENS.FISCAL_GERADA(tipo, linha));
      } else {
        console.warn(CONFIG.MENSAGENS.FISCAL_DESCARTADA(tipo, numero));
      }
    }
  }

  return { contabeis, fiscais };
}


// ============================================================================
// FUNÇÕES DE EXPORTAÇÃO
// ============================================================================
export function exportToTxt(data: string[], outputPath: string): void {
  const conteudo = data.length > 0 ? data.join('\r\n') + '\r\n' : 'Arquivo sem dados.\r\n';
  fs.writeFileSync(outputPath, conteudo, 'utf8');
  console.log(`💾 Escritas ${data.length} linhas em ${outputPath}`);
}

export function exportTxtGenerico(data: string[], outputPath: string, nomeRegra: string): void {
  const conteudo = data.length > 0
    ? data.join('\r\n') + '\r\n'
    : `Arquivo da regra ${nomeRegra} gerado automaticamente, mas sem dados.\r\n`;
  fs.writeFileSync(outputPath, conteudo, 'utf8');
  console.log(`🧾 Arquivo da regra ${nomeRegra} escrito: ${outputPath}`);
}
