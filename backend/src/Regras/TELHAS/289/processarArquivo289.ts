import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as xlsx from 'xlsx';

// ============================================================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================================================
const CONFIG = {
  COLUNAS: {
    RELATORIO: 1, // Coluna A: deve conter 289 extrairDadosPagamento
    IMPORT_LOCATION: 2, // Coluna B: deve conter 5, 7, 10, 11 ou 12
    NUM_PARCELA: 17, // Coluna Q (Número da Parcela)
    MOTORISTA: 5, // Coluna E
    PLACA: 6, // Coluna F
    HISTORICO_G: 12, // Coluna L (Fornecedor/Cliente)
    HISTORICO_L: 12, // Coluna L (para histórico – parceiro)
    TIPO_DESPESA: 14, // Coluna N (Tipo Despesa)
    HISTORICO_Q: 17, // Coluna Q (Número da Nota para histórico)
    DATA: 19, // Coluna S (Data de Pagamento)
    VALOR: 20, // Coluna T (Valor de Pagamento)
    MEIO_PAGAMENTO: 21, // Coluna U (Meio de Pagamento – "13" indica caixa)
    TIPO_OPERACAO: 24, // Coluna Y (Tipo Operação)
  },
  VALORES: {
    RELATORIO_ESPERADO: 289,
    MEIO_PAGAMENTO_CAIXA: '13',
    TIPO_OPERACAO_CONTABIL: '1602',
    TIPO_EMPRESA_MATRIZ: 5,
    TIPO_EMPRESA_FILIAL_3: 7, // Ponta Grossa
    TIPO_EMPRESA_FILIAL_4: 10, // Toledo
    TIPO_EMPRESA_FILIAL_5: 11, // Pato Branco
    TIPO_EMPRESA_FILIAL_6: 12, // Guarapuava
  },
  MENSAGENS: {
    ERRO_PROCESSAMENTO: '❌ Erro no processamento da regra TELHAS 289:',
    ARQUIVO_GERADO: '📝 Arquivo escrito em:',
    ARQUIVO_SEM_DADOS:
      'Arquivo gerado automaticamente, mas não há dados processados.',
    ARQUIVO_REGRA_SEM_DADOS:
      'Arquivo da regra {regra} gerado automaticamente, mas sem dados.',
    ARQUIVO_REGRA_ESCRITO: '🧾 Arquivo da regra {regra} escrito:',
  },
};

// ============================================================================
// MAPEAMENTOS PARA TELHAS
// ============================================================================
const MAPEAMENTOS = {
  DESPESA: {
    refeicao: '1288',
    pedagio: '2209',
    hospedagem: '1476',
    combustivel: '1266',
    manutencao: '1268',
  },
  IMPORTACAO: {
    [CONFIG.VALORES.TIPO_EMPRESA_MATRIZ]: '0001', // Matriz
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_3]: '0003', // Filial 3 – Ponta Grossa
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_4]: '0004', // Filial 4 – Toledo
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_5]: '0005', // Filial 5 – Pato Branco
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_6]: '0006', // Filial 6 – Guarapuava
  },
  EXTRA: {
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_3]: '1000', // Para Filial 3 – Ponta Grossa
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_4]: '2053', // Para Filial 4 – Toledo
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_5]: '2054', // Para Filial 5 – Pato Branco
    [CONFIG.VALORES.TIPO_EMPRESA_FILIAL_6]: '2256', // Para Filial 6 – Guarapuava
  },
};

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================
interface DadosPagamento {
  relatorio: number;
  importLocation: number;
  motorista: string;
  placa: string;
  fornecedorCliente: string;
  parceiro: string;
  tipoDespesa: string;
  numeroNota: string;
  dataPagamento: string;
  valorPagamento: number;
  meioPagamento: string;
  tipoOperacao: string;
}

interface DadosDuplicata {
  chaveDuplicata: string;
  numeroDuplicata: string;
  historicoNota: string;
}

interface ResultadoProcessamento {
  contabil: string[];
  fiscal: string[];
  duplicatas: any[];
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================
class Formatador {
  static formatarData(dataStr: string): string {
    if (!dataStr) return '';
    const partes = dataStr.split(' ')[0].split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano.slice(-2)}`;
    }
    return dataStr;
  }

  static formatarValor(valor: any): string {
    const num = parseFloat(valor) || 0;
    return num.toFixed(2).replace('.', ',');
  }

  static normalizarDuplicata(duplicata: any): string {
    return String(duplicata || '')
      .replace(/[.,]/g, '')
      .replace(/\s/g, '')
      .replace(/^0+/, '');
  }

  static normalizarTexto(str: string): string {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}

class ProcessadorExcel {
  static async lerArquivoExcel(caminho: string): Promise<ExcelJS.Worksheet> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(caminho);
    return workbook.worksheets[0];
  }

  static extrairLinhas(worksheet: ExcelJS.Worksheet): any[] {
    const linhas: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) linhas.push(row);
    });
    return linhas;
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE PROCESSAMENTO
// ============================================================================
export async function processarArquivo289Telhas(
  inputExcelPath: string,
  duplicatasExcelPath: string,
): Promise<ResultadoProcessamento> {
  try {
    console.log('📂 Carregando arquivos TELHAS 289...');

    const [worksheetPag, worksheetDup] = await Promise.all([
      ProcessadorExcel.lerArquivoExcel(inputExcelPath),
      ProcessadorExcel.lerArquivoExcel(duplicatasExcelPath),
    ]);

    const pagamentosRows = ProcessadorExcel.extrairLinhas(worksheetPag);
    const duplicatasRows = ProcessadorExcel.extrairLinhas(worksheetDup);

    const mapeamentoDuplicatas = criarMapeamentoDuplicatas(duplicatasRows);
    const resultado = processarPagamentos(pagamentosRows, mapeamentoDuplicatas);

    return resultado;
  } catch (error) {
    console.error(CONFIG.MENSAGENS.ERRO_PROCESSAMENTO, error);
    throw error;
  }
}

// ============================================================================
// FUNÇÕES DE PROCESSAMENTO
// ============================================================================
function criarMapeamentoDuplicatas(
  duplicatasRows: any[],
): Map<string, DadosDuplicata> {
  const mapeamento = new Map<string, DadosDuplicata>();
  const numerosDuplicatas = new Set<string>();

  duplicatasRows.forEach((row, index) => {
    const raw = row.getCell(3).value;
    const numeroDuplicata = Formatador.normalizarDuplicata(
      typeof raw === 'number' ? Math.floor(raw).toString() : String(raw),
    );
    const chaveDuplicata = String(row.getCell(1).value || '').trim();
    const historicoNota = String(row.getCell(6).value || '').trim();

    if (index < 5) {
      console.log(
        `📌 Duplicata [${index + 1}]: raw=${raw}, normalizado=${numeroDuplicata}`,
      );
    }

    if (numeroDuplicata) {
      mapeamento.set(numeroDuplicata, {
        chaveDuplicata,
        numeroDuplicata,
        historicoNota,
      });
      numerosDuplicatas.add(numeroDuplicata);
    }
  });

  return mapeamento;
}

function processarPagamentos(
  pagamentosRows: any[],
  mapeamentoDuplicatas: Map<string, DadosDuplicata>,
): ResultadoProcessamento {
  const resultado: ResultadoProcessamento = {
    contabil: [],
    fiscal: [],
    duplicatas: [],
  };
  console.log(`🔄 Total de linhas lidas: ${pagamentosRows.length}`);

  pagamentosRows.forEach((row) => {
    const dados = extrairDadosPagamento(row);

    if (!validarDadosPagamento(dados)) {
      return;
    }
    console.log(
      `➡️ Lendo linha: Relatório=${dados.relatorio}, Empresa=${dados.importLocation}, TipoOperação=${dados.tipoOperacao}, TipoDespesa=${dados.tipoDespesa}`,
    );

    const localImport = MAPEAMENTOS.IMPORTACAO[dados.importLocation];
    const numeroDuplicata = Formatador.normalizarDuplicata(dados.numeroNota);

    let infoDuplicata = mapeamentoDuplicatas.get(numeroDuplicata);

    if (!infoDuplicata) {
      adicionarDuplicataNaoEncontrada(
        resultado,
        dados,
        localImport,
        numeroDuplicata,
      );

      // Criar info "genérico" para seguir o lançamento contábil
      infoDuplicata = {
        chaveDuplicata: numeroDuplicata,
        numeroDuplicata: numeroDuplicata,
        historicoNota: numeroDuplicata,
      };
    }

    const tipoContabilReconhecido =
      dados.tipoOperacao === CONFIG.VALORES.TIPO_OPERACAO_CONTABIL ||
      !!MAPEAMENTOS.DESPESA[dados.tipoDespesa];

    console.log(
      `[DEBUG] tipoOperacao="${dados.tipoOperacao}", tipoDespesa="${dados.tipoDespesa}"`,
    );

    if (tipoContabilReconhecido) {
      processarContabil(resultado, dados, localImport, infoDuplicata);
      console.log('🔢 Enviando para CONTÁBIL');
    } else {
      processarFiscal(resultado, dados, localImport, infoDuplicata);
      console.log('📄 Enviando para FISCAL');
    }
  });

  ordenarPorData(resultado.contabil);
  return resultado;
}

function extrairDadosPagamento(row: any): DadosPagamento {
  return {
    relatorio: Number(row.getCell(CONFIG.COLUNAS.RELATORIO).value),
    importLocation: Number(row.getCell(CONFIG.COLUNAS.IMPORT_LOCATION).value),
    motorista: String(row.getCell(CONFIG.COLUNAS.MOTORISTA).value || '').trim(),
    placa: String(row.getCell(CONFIG.COLUNAS.PLACA).value || '').trim(),
    fornecedorCliente: String(
      row.getCell(CONFIG.COLUNAS.HISTORICO_G).value || '',
    ).trim(),
    parceiro: String(
      row.getCell(CONFIG.COLUNAS.HISTORICO_L).value || '',
    ).trim(),
    tipoDespesa: Formatador.normalizarTexto(
      row.getCell(CONFIG.COLUNAS.TIPO_DESPESA).value || '',
    ).toLowerCase(),
    numeroNota: String(
      row.getCell(CONFIG.COLUNAS.HISTORICO_Q).value || '',
    ).trim(),
    dataPagamento: String(row.getCell(CONFIG.COLUNAS.DATA).value),
    valorPagamento: Number(row.getCell(CONFIG.COLUNAS.VALOR).value),
    meioPagamento: String(
      row.getCell(CONFIG.COLUNAS.MEIO_PAGAMENTO).value || '',
    ).trim(),
    tipoOperacao: String(
      row.getCell(CONFIG.COLUNAS.TIPO_OPERACAO).value || '',
    ).trim(),
  };
}

function validarDadosPagamento(dados: DadosPagamento): boolean {
  return (
    dados.relatorio === CONFIG.VALORES.RELATORIO_ESPERADO &&
    [
      CONFIG.VALORES.TIPO_EMPRESA_MATRIZ,
      CONFIG.VALORES.TIPO_EMPRESA_FILIAL_3,
      CONFIG.VALORES.TIPO_EMPRESA_FILIAL_4,
      CONFIG.VALORES.TIPO_EMPRESA_FILIAL_5,
      CONFIG.VALORES.TIPO_EMPRESA_FILIAL_6,
    ].includes(dados.importLocation)
  );
}

function adicionarDuplicataNaoEncontrada(
  resultado: ResultadoProcessamento,
  dados: DadosPagamento,
  localImport: string,
  numeroDuplicata: string,
): void {
  resultado.duplicatas.push({
    Código: localImport,
    'Fornecedor/Cliente': dados.fornecedorCliente,
    Duplicata: numeroDuplicata,
    Data: Formatador.formatarData(dados.dataPagamento),
    'Valor Bruto': Formatador.formatarValor(dados.valorPagamento),
    'Valor Líquido': Formatador.formatarValor(dados.valorPagamento),
    Banco: dados.meioPagamento,
    Observação: 'Duplicata não consta no arquivo de duplicatas em aberto',
  });
}

function processarContabil(
  resultado: ResultadoProcessamento,
  dados: DadosPagamento,
  localImport: string,
  infoDuplicata: DadosDuplicata,
): void {
  const debito = MAPEAMENTOS.DESPESA[dados.tipoDespesa.toLowerCase()] || '0000';
  const dataFormatada = Formatador.formatarData(dados.dataPagamento);
  const valorFormatado = Formatador.formatarValor(dados.valorPagamento);
  const historico = `292; CFE. DOC. ${infoDuplicata.historicoNota} - ${dados.parceiro} - MOTORISTA: ${dados.motorista.toUpperCase()} PLACA: ${dados.placa.toUpperCase()}`;

  if (debito === '0000') {
    console.warn(
      `⚠️ Tipo de despesa não mapeada: "${dados.tipoDespesa}" — lançamento ignorado.`,
    );
    return;
  }

  resultado.contabil.push(
    `${localImport};${dataFormatada};${debito};${dados.meioPagamento};${valorFormatado};292;${historico}`,
  );
}

function processarFiscal(
  resultado: ResultadoProcessamento,
  dados: DadosPagamento,
  localImport: string,
  infoDuplicata: DadosDuplicata,
): void {
  const tabelaFiscal =
    dados.meioPagamento === CONFIG.VALORES.MEIO_PAGAMENTO_CAIXA
      ? '483'
      : '8034';
  const dataFormatada = Formatador.formatarData(dados.dataPagamento);
  const numeroParcela = dados.numeroNota || '1';
  const tipoEmpresaFiscal =
    dados.importLocation === CONFIG.VALORES.TIPO_EMPRESA_MATRIZ
      ? '1'
      : dados.importLocation === CONFIG.VALORES.TIPO_EMPRESA_FILIAL_3
        ? '3'
        : dados.importLocation === CONFIG.VALORES.TIPO_EMPRESA_FILIAL_4
          ? '4'
          : dados.importLocation === CONFIG.VALORES.TIPO_EMPRESA_FILIAL_5
            ? '5'
            : '6';

  resultado.fiscal.push(
    `${tipoEmpresaFiscal};1;${infoDuplicata.chaveDuplicata};001;${dataFormatada};${dataFormatada};${numeroParcela};${Formatador.formatarValor(dados.valorPagamento)};0,00;${tabelaFiscal};${infoDuplicata.historicoNota};0,00;0,00`,
  );

  if (
    dados.meioPagamento !== CONFIG.VALORES.MEIO_PAGAMENTO_CAIXA &&
    dados.importLocation !== CONFIG.VALORES.TIPO_EMPRESA_MATRIZ
  ) {
    const historicoExtra = `270; ${dados.numeroNota} - ${dados.parceiro}`;
    const contaExtra = MAPEAMENTOS.EXTRA[dados.importLocation];
    resultado.contabil.push(
      `${localImport};${dataFormatada};${contaExtra};${dados.meioPagamento};${Formatador.formatarValor(dados.valorPagamento)};"${historicoExtra}"`,
    );
  }
  console.log(
    `✅ Vai processar CONTÁBIL - TipoDespesas=${dados.tipoDespesa}, Conta: ${MAPEAMENTOS.DESPESA[dados.tipoDespesa]}`,
  );
}

function ordenarPorData(linhas: string[]): void {
  linhas.sort((a, b) => {
    const [dA, mA, yA] = a.split(';')[1].split('/').map(Number);
    const [dB, mB, yB] = b.split(';')[1].split('/').map(Number);
    return (
      new Date(2000 + yB, mB - 1, dB).getTime() -
      new Date(2000 + yA, mA - 1, dA).getTime()
    );
  });
}

// ============================================================================
// FUNÇÕES DE EXPORTAÇÃO
// ============================================================================
export function exportToTxt289(data: string[], outputPath: string): void {
  const conteudo =
    data.length > 0
      ? data.join('\r\n') + '\r\n'
      : CONFIG.MENSAGENS.ARQUIVO_SEM_DADOS + '\r\n';

  fs.writeFileSync(outputPath, conteudo, { encoding: 'utf8' });
  console.log(
    `${CONFIG.MENSAGENS.ARQUIVO_GERADO} ${outputPath} (${data.length} linhas)`,
  );
}

export function exportTxtGenerico(
  data: string[],
  outputPath: string,
  nomeRegra: string,
): void {
  const conteudo =
    data.length > 0
      ? data.join('\r\n') + '\r\n'
      : CONFIG.MENSAGENS.ARQUIVO_REGRA_SEM_DADOS.replace('{regra}', nomeRegra) +
        '\r\n';

  fs.writeFileSync(outputPath, conteudo, { encoding: 'utf8' });
  console.log(
    CONFIG.MENSAGENS.ARQUIVO_REGRA_ESCRITO.replace('{regra}', nomeRegra) +
      ` ${outputPath}`,
  );
}
