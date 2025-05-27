import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

/* ===================================================
   INTERFACES E TIPOS
   =================================================== */
/**
 * Interface que define a estrutura de uma linha do Excel DataFormatter 
 * @interface ExcelRow
 * @property {any} [key: number] - Valor da célula na coluna especificada
 */
interface ExcelRow {
  [key: number]: any;
}

/**
 * Interface que define as informações de uma duplicata
 * @interface DuplicataInfo
 * @property {string} chaveDuplicata - Chave única da duplicata
 * @property {string} valorColunaF - Valor da coluna F da duplicata
 */
interface DuplicataInfo {
  chaveDuplicata: string;
  valorColunaF: string;
}

/**
 * Interface que define o resultado do processamento
 * @interface ProcessamentoResultado
 * @property {string[]} linhasContabeis - Array de linhas contábeis processadas
 * @property {string[]} linhasFiscais - Array de linhas fiscais processadas
 * @property {any[]} duplicatasNaoEncontradas - Array de duplicatas não encontradas
 */
interface ProcessamentoResultado {
  linhasContabeis: string[];
  linhasFiscais: string[];
  duplicatasNaoEncontradas: any[];
}

/* ===================================================
   CONSTANTES E ENUMS
   =================================================== */
/**
 * Enum que define os tipos de empresa
 * @enum {number}
 */
enum TipoEmpresa {
  MATRIZ = 6,  // Código para matriz
  FILIAL = 9   // Código para filial
}

/**
 * Enum que define os tipos de título a serem ignorados
 * @enum {string}
 */
enum TipoTitulo {
  IGNORAR_16 = '16',  // Título tipo 16 a ser ignorado
  IGNORAR_17 = '17'   // Título tipo 17 a ser ignorado
}

/**
 * Enum que define os tipos de operação
 * @enum {string}
 */
enum TipoOperacao {
  ADIANTAMENTO_FORNECEDORES = '1604',  // Operação de adiantamento a fornecedores
  ENERGIA_ELETRICA = '1152',           // Operação de energia elétrica
  DESPESAS_BANCARIAS = '1601',         // Operação de despesas bancárias
  DESPESAS_DIVERSAS_1 = '1610',        // Operação de despesas diversas tipo 1
  DESPESAS_DIVERSAS_2 = '1602'         // Operação de despesas diversas tipo 2
}

/**
 * Enum que define os índices das colunas do Excel
 * @enum {number}
 */
enum ColunaExcel {
  RELATORIO = 1,          // Coluna do relatório
  IMPORT_LOCATION = 2,    // Coluna da localização de importação
  TIPO_TITULO = 11,       // Coluna do tipo de título
  HISTORICO_I = 9,        // Coluna do histórico I
  HISTORICO_G = 7,        // Coluna do histórico G
  NATUREZA = 25,          // Coluna da natureza
  CONTA_BANCARIA = 22,    // Coluna da conta bancária
  DATA = 18,              // Coluna da data
  VALOR_O = 15,           // Coluna do valor O
  VALOR_S = 19,           // Coluna do valor S
  VALOR_AC = 29,          // Coluna do valor AC
  VALOR_AD = 30,          // Coluna do valor AD
  VALOR_AE = 31,          // Coluna do valor AE
  VALOR_AF = 32,          // Coluna do valor AF
  VALOR_AG = 33,          // Coluna do valor AG
  TIPO_OPERACAO = 36,     // Coluna do tipo de operação
  HISTORICO_AM = 39,      // Coluna do histórico AM
  DUPLICATA = 9,          // Coluna da duplicata
  CONTA_BANCARIA_W = 23   // Coluna da conta bancária W
}

/* ===================================================
   MAPEAMENTOS E CONJUNTOS
   =================================================== */
/**
 * Mapeamento de importação para cada tipo de empresa
 * @const {Object}
 */
const MAPA_IMPORT_MAP: { [key: number]: string } = {
  [TipoEmpresa.MATRIZ]: '0001',  // Código para matriz
  [TipoEmpresa.FILIAL]: '0002'   // Código para filial
};

/**
 * Mapeamento extra para adiantamentos (filial)
 * @const {Map}
 */
const MAPA_EXTRA_ADIANT_MAP = new Map<number, string>([
  [TipoEmpresa.FILIAL, '1513']  // Código para filial
]);

const EXTRA_ACCOUNT_MAP = new Map<number, string>([
  [TipoEmpresa.FILIAL, '1513'],
]);
function getExtraAccount(loc: number): string {
  return EXTRA_ACCOUNT_MAP.get(loc) || '';
}

/**
 * Mapeamento extra para descontos (filial)
 * @const {Map}
 */
const MAPA_EXTRA_DISCOUNT_MAP = new Map<number, string>([
  [TipoEmpresa.FILIAL, '1513']  // Código para filial
]);

/**
 * Mapeamento extra para juros/multa (filial)
 * @const {Map}
 */
const MAPA_EXTRA_JUROS_MULTA_MAP = new Map<number, string>([
  [TipoEmpresa.FILIAL, '1513']  // Código para filial
]);

/**
 * Conjunto de naturezas a serem ignoradas
 * @const {Set}
 */
const IGNORED_NATUREZAS = new Set([
  '110303', '110308', '110304', '110309',
  '320101', '180101', '140107', '140108',
  '140411', '180102', '140109', '140507',
  '140137', '140138', '140111'
]);

/**
 * Conjunto de operações a serem ignoradas
 * @const {Set}
 */
const IGNORED_OPERACOES = new Set(['1660', '16', '17']);

/**
 * Mapeamento para despesas diversas
 * @const {Object}
 */
const MAP_DIVERSAS: { [natureza: string]: string } = {
  '110310': '857',   // Natureza 110310 mapeada para conta 857 
  '140201': '908',   // Natureza 140201 mapeada para conta 908
  '320206': '2381',  // Natureza 320206 mapeada para conta 2381
  '130302': '1288',
  '140302': '907',
  '140112': '903',
  '140703': '2381',
  '160203': '1274',
  '140203': '2381',
  '140709': '2381',
  '140711': '1315',
  '150204': '2381',
  '150212': '2381',
  '150216': '2381',
  '140116': '2381',
  '140403': '2381',
  '140304': '905',
  '140501': '908',
  '170201': '1362',
  '190201': '1292',
  '170204': '1268',
  '170207': '1345',
  '140603': '2381',
  '140503': '1274',
  '180103': '2381',
  '140601': '2381',
  '140114': '2381',
  '140120': '2381',
  '170202': '916',
  '140204': '916',
  '120102': '661',
  '150207': '1328',
  '140301': '919',
  '140307': '919',
  '160205': '2381',
  '140104': '530832',
  '140102': '1198',
  '140305': '1259',
  '140705': '1263',
  '140313': '1311',
  '140129': '1288',
  '190107': '1304',
  '140202': '1291',
  '320202': '1475',
  '320208': '1292',
  '320203': '1475',
  '320204': '1291',
  '130301': '2209',
  '140130': '1300',
  '140708': '1300',
  '140402': '2381',
  '140410': '1293',
  '140702': '1302',
  '140125': '2381',
  '140701': '1276'
};

/* ===================================================
   FUNÇÕES PARA REMOÇÃO DE CARACTERES ESPECIAIS
=================================================== */
/**
 * Remove acentos, símbolos e caracteres indesejados de um texto.
 * Você pode ajustar a lista de caracteres na regex conforme a necessidade.
 * @param {string} texto - Texto a ser limpo
 * @returns {string} Texto limpo
 */
function removerCaracteresEspeciais(texto: string): string {
  console.log("Texto original:", texto);
  const resultado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')               // remove acentos
    .replace(/[ºª^~'""''–—°"´`\u2013\u2014]/g, '') // remove outros caracteres específicos (incluindo – e —)
    .trim();
  console.log("Texto limpo:", resultado);
  return resultado;
}



/* ===================================================
   CLASSES DE PROCESSAMENTO
=================================================== */
class ExcelProcessor {
  static async readExcelFile(filePath: string): Promise<ExcelRow[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const rows: ExcelRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) rows.push(row.values);
    });
    return rows;
  }

  static async exportToExcel(data: any[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Duplicatas');
    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
      data.forEach(item => worksheet.addRow(item));
    }
    await workbook.xlsx.writeFile(outputPath);
  }
}

class DataFormatter {
  static normalizeText(text: string): string {
    // Aqui aplicamos a função de remoção de caracteres especiais
    return removerCaracteresEspeciais(text);
  }

    /**
   * Formata uma data no formato dd/MM/yy
   * @param {string} dateStr - Data no formato yyyy-mm-dd
   * @returns {string} Data formatada
   */
  static formatDate(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.slice(-2)}`;
    }
    return dateStr;
  }

    /**
   * Extrai e formata a data de uma linha do Excel
   * @param {ExcelRow} row - Linha do Excel
   * @returns {string} Data formatada
   */
  static parseISODateFromRow(row: ExcelRow): string {
    if (row[ColunaExcel.DATA]) {
      const datePart = row[ColunaExcel.DATA].split(' ')[0];
      const [day, month, year] = datePart.split('/');
      return `${year}-${month}-${day}`;
    }
    return '1900-01-01';
  }
}


/**
 * Classe responsável por processar duplicatas
 * @class DuplicataProcessor
 */
class DuplicataProcessor {
  /**
   * Carrega o mapeamento de duplicatas de um arquivo Excel
   * @param {string} caminhoArquivoDuplicatas - Caminho do arquivo de duplicatas
   * @returns {Promise<Map<string, string>>} Mapeamento de duplicatas
   */
  static async carregarMapeamentoDuplicatas(caminhoArquivoDuplicatas: string): Promise<Map<string, string>> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(caminhoArquivoDuplicatas);
    const worksheet = workbook.worksheets[0];
    
    const mapeamentoDuplicatas = new Map<string, string>();
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const numeroDuplicata = row.getCell(3).toString().trim();
        const chaveDuplicata = row.getCell(1).toString().trim();
        const valorColunaF = row.getCell(6).toString().trim();
        if (numeroDuplicata && chaveDuplicata) {
          mapeamentoDuplicatas.set(numeroDuplicata, JSON.stringify({ chaveDuplicata, valorColunaF }));
        }
      }
    });
    console.log(`Mapeamento de duplicatas carregado: ${mapeamentoDuplicatas.size} entradas`);
    return mapeamentoDuplicatas;
  }

  /**
   * Processa as duplicatas de um conjunto de linhas
   * @param {ExcelRow[]} rows - Linhas do Excel
   * @returns {any[]} Array de duplicatas não encontradas
   */
  static processarDuplicatas(rows: ExcelRow[]): any[] {
    const output: any[] = [];
    rows.forEach((row, index) => {
      const tipoTitulo = row[ColunaExcel.TIPO_TITULO]?.toString().trim();
      if ([TipoTitulo.IGNORAR_16, TipoTitulo.IGNORAR_17].includes(tipoTitulo as TipoTitulo)) return;

      const duplicata = row[ColunaExcel.DUPLICATA]?.toString().trim();
      if (!duplicata) {
        output.push({
          Linha: index + 1,
          "Número Duplicata": 'NÃO INFORMADO',
          "Observação": "Duplicata não encontrada"
        });
      }
    });
    console.log(`Total de duplicatas não encontradas: ${output.length}`);
    return output;
  }
}

/**
 * Classe responsável por processar lançamentos
 * @class LancamentoProcessor
 */
class LancamentoProcessor {
  /**
   * Processa lançamento extra de matriz para duplicata
   * @param {ExcelRow} row - Linha do Excel
   * @returns {string} Linha formatada
   */
  static processarExtraLancamentoMatrizDuplicata(row: ExcelRow): string {
    const dataFormatada = DataFormatter.formatDate(DataFormatter.parseISODateFromRow(row));
    const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);

    const localImportacao = importLocation === TipoEmpresa.FILIAL ? "0001" : MAPA_IMPORT_MAP[importLocation];
    const valor = row[ColunaExcel.VALOR_S] ? parseFloat(row[ColunaExcel.VALOR_S]).toFixed(2) : "0.00";
    const codV = row[ColunaExcel.CONTA_BANCARIA]?.toString().trim();
    const histI = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_I]?.toString() || '');
    const histG = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_G]?.toString() || '');
    
    return `${localImportacao};${dataFormatada};1513;${codV};${valor};270;${histI}-${histG}`;
  }

  /**
   * Processa adiantamentos a fornecedores
   * @param {ExcelRow} row - Linha do Excel
   * @returns {string[]} Array de linhas formatadas
   */
  static processarAdiantamentoFornecedores(row: ExcelRow): string[] {
    const results: string[] = [];
    const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);
    if (![TipoEmpresa.MATRIZ, TipoEmpresa.FILIAL].includes(importLocation)) return results;
    const localImportacao = MAPA_IMPORT_MAP[importLocation];

    const contaBancaria = row[ColunaExcel.CONTA_BANCARIA]?.toString();
    const dataISO = DataFormatter.parseISODateFromRow(row);
    const dataFormatada = DataFormatter.formatDate(dataISO);
    const valorS = row[ColunaExcel.VALOR_S] ? parseFloat(row[ColunaExcel.VALOR_S]).toFixed(2) : "0.00";
    const historicoG = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_G]?.toString() || '').replace(/[°"]/g, '');
    const historico = `2164; ${historicoG} CONFORME RELATORIO FINANCEIRO`;

    if (contaBancaria === '13') {
      results.push(`${localImportacao};${dataFormatada};579;13;${valorS};${historico}`);
    } else {
      if (importLocation === TipoEmpresa.MATRIZ) {
        results.push(`${localImportacao};${dataFormatada};579;${contaBancaria};${valorS};${historico}`);
      } else if (importLocation === TipoEmpresa.FILIAL) {
        results.push(`${localImportacao};${dataFormatada};579;1516;${valorS};${historico}`);
        results.push(`0001;${dataFormatada};${MAPA_EXTRA_ADIANT_MAP.get(importLocation)};${contaBancaria};${valorS};${historico}`);
      }
    }
    return results;
  }

  /**
   * Processa despesas diversas
   * @param {ExcelRow} row - Linha do Excel
   * @returns {string[]} Array de linhas formatadas
   */
  static processarDespesasDiversas(row: ExcelRow): string[] {
    const results: string[] = [];
    const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);
    if (![TipoEmpresa.MATRIZ, TipoEmpresa.FILIAL].includes(importLocation)) return results;
    const localImportacao = MAPA_IMPORT_MAP[importLocation];

    const contaBancaria = row[ColunaExcel.CONTA_BANCARIA]?.toString();
    const dataISO = DataFormatter.parseISODateFromRow(row);
    const dataFormatada = DataFormatter.formatDate(dataISO);

    const valorO = row[ColunaExcel.VALOR_O] ? parseFloat(row[ColunaExcel.VALOR_O]).toFixed(2) : "0.00";
    const valorAC = row[ColunaExcel.VALOR_AC] ? parseFloat(row[ColunaExcel.VALOR_AC]).toFixed(2) : "0.00";
    const valorAD = row[ColunaExcel.VALOR_AD] ? parseFloat(row[ColunaExcel.VALOR_AD]).toFixed(2) : "0.00";
    const valorAE = row[ColunaExcel.VALOR_AE] ? parseFloat(row[ColunaExcel.VALOR_AE]).toFixed(2) : "0.00";
    const valorAF = row[ColunaExcel.VALOR_AF] ? parseFloat(row[ColunaExcel.VALOR_AF]).toFixed(2) : "0.00";
    const valorAG = row[ColunaExcel.VALOR_AG] ? parseFloat(row[ColunaExcel.VALOR_AG]).toFixed(2) : "0.00";

    const natureza = row[ColunaExcel.NATUREZA]?.toString();
    let contaDebito = MAP_DIVERSAS[natureza];
    if (natureza === '140203') {
      contaDebito = '1302';
    }
    if (!contaDebito) return results;

    const historicoI = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_I]?.toString() || '');
    const histG = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_G]?.toString() || '');
    const historicoAM = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_AM]?.toString() || '');
    const historicoCompleto = `292;CFE. DOC ${historicoI} - ${histG} – ${historicoAM}`;

    if (contaBancaria === '13') {
      results.push(`${localImportacao};${dataFormatada};${contaDebito};13;${valorO};${historicoCompleto}`);
      if (valorAC !== '0.00') {
        results.push(`${localImportacao};${dataFormatada};13;1111;${valorAC};0;Desconto s/ Duplic. N: ${historicoI} - ${histG}`);
      }
      if (valorAG !== '0.00') {
        results.push(`${localImportacao};${dataFormatada};13;1111;${valorAG};0;Taxa Administr. N: ${historicoI} - ${histG}`);
      }
      if (valorAD !== '0.00' || valorAF !== '0.00') {
        const totalJuros = (parseFloat(valorAD) + parseFloat(valorAF)).toFixed(2);
        results.push(`${localImportacao};${dataFormatada};1381;13;${totalJuros};0;Pagto Juros s/ Duplic. N: ${historicoI} - ${histG}`);
      }
      if (valorAE !== '0.00') {
        results.push(`${localImportacao};${dataFormatada};1383;13;${valorAE};0;Pagto Multa s/ Duplic. N: ${historicoI} - ${histG}`);
      }
    } else {
      if (importLocation === TipoEmpresa.MATRIZ) {
        results.push(`${localImportacao};${dataFormatada};${contaDebito};${contaBancaria};${valorO};${historicoCompleto}`);
      } else if (importLocation === TipoEmpresa.FILIAL) {
        results.push(`${localImportacao};${dataFormatada};${contaDebito};1516;${valorO};${historicoCompleto}`);
        results.push(`0001;${dataFormatada};${MAPA_EXTRA_DISCOUNT_MAP.get(importLocation) || '1513'};${contaBancaria};${valorO};${historicoCompleto}`);
      }

      if (valorAC !== '0.00') {
        if (importLocation === TipoEmpresa.MATRIZ) {
          results.push(`${localImportacao};${dataFormatada};1111;${contaBancaria};${valorAC};0;Desconto s/ Duplic. N: ${historicoI} - ${histG}`);
        } else if (importLocation === TipoEmpresa.FILIAL) {
          results.push(`${localImportacao};${dataFormatada};1514;1111;${valorAC};0;Desconto s/ Duplic. N: ${historicoI} - ${histG}`);
          results.push(`0001;${dataFormatada};${MAPA_EXTRA_DISCOUNT_MAP.get(importLocation)};1111;${valorAC};0;Desconto s/ Duplic. N: ${historicoI} - ${histG}`);
        }
      }

      if (valorAG !== '0.00') {
        if (importLocation === TipoEmpresa.MATRIZ) {
          results.push(`${localImportacao};${dataFormatada};1111;${contaBancaria};${valorAG};0;Taxa Administr. N: ${historicoI} - ${histG}`);
        } else if (importLocation === TipoEmpresa.FILIAL) {
          results.push(`${localImportacao};${dataFormatada};1514;1111;${valorAG};0;Taxa Administr. N: ${historicoI} - ${histG}`);
          results.push(`0001;${dataFormatada};${MAPA_EXTRA_DISCOUNT_MAP.get(importLocation)};1111;${valorAG};0;Taxa Administr. N: ${historicoI} - ${histG}`);
        }
      }

      if (valorAD !== '0.00' || valorAF !== '0.00') {
        const totalJuros = (parseFloat(valorAD) + parseFloat(valorAF)).toFixed(2);
        if (importLocation === TipoEmpresa.MATRIZ) {
          results.push(`${localImportacao};${dataFormatada};1381;${contaBancaria};${totalJuros};0;Pagto Juros s/ Duplic. N: ${historicoI} - ${histG}`);
        } else if (importLocation === TipoEmpresa.FILIAL) {
          results.push(`${localImportacao};${dataFormatada};1381;1516;${totalJuros};0;Pagto Juros s/ Duplic. N: ${historicoI} - ${histG}`);
          results.push(`0001;${dataFormatada};${MAPA_EXTRA_JUROS_MULTA_MAP.get(importLocation)};${contaBancaria};${totalJuros};0 - Pagto Juros s/ Duplic. N: ${historicoI} - ${histG}`);
        }
      }

      if (valorAE !== '0.00') {
        if (importLocation === TipoEmpresa.MATRIZ) {
          results.push(`${localImportacao};${dataFormatada};1383;${contaBancaria};${valorAE};0;Pagto Multa s/ Duplic. N: ${historicoI} - ${histG}`);
        } else if (importLocation === TipoEmpresa.FILIAL) {
          results.push(`${localImportacao};${dataFormatada};1383;1516;${valorAE};0;Pagto Multa s/ Duplic. N: ${historicoI} - ${histG}`);
          results.push(`0001;${dataFormatada};${MAPA_EXTRA_JUROS_MULTA_MAP.get(importLocation)};${contaBancaria};${valorAE};0;Pagto Multa s/ Duplic. N: ${historicoI} - ${histG}`);
        }
      }
    }
    return results;
  }
}

/**
 * Classe responsável por processar energia e despesas
 * @class EnergiaDespesasProcessor
 */
class EnergiaDespesasProcessor {
  /**
   * Processa despesas de energia elétrica
   * @param {ExcelRow} row - Linha do Excel
   * @returns {string[]} Array de linhas formatadas
   */
  static processarEnergia(row: ExcelRow): string[] {
    const results: string[] = [];
    const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);
    const localImportacao = MAPA_IMPORT_MAP[importLocation];
    
    const codV = row[ColunaExcel.CONTA_BANCARIA]?.toString().trim();
    const codW = row[ColunaExcel.CONTA_BANCARIA_W]?.toString().trim();
    
    const ignoreSet = new Set(["50", "52", "111"]);
    if (ignoreSet.has(codV) && ignoreSet.has(codW)) {
      return results;
    }
    
    const dataFormatada = DataFormatter.formatDate(DataFormatter.parseISODateFromRow(row));
    const valor = row[ColunaExcel.VALOR_O] ? parseFloat(row[ColunaExcel.VALOR_O]).toFixed(2) : "0.00";
    
    const histI = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_I]?.toString() || '');
    const histG = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_G]?.toString() || '');
    const histAM = row[ColunaExcel.HISTORICO_AM] ? DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_AM].toString()) : '';
    const historicoCompleto = `292;CFE. DOC ${histI} - ${histG} - ${histAM}`;
    
    // Garantir que os valores são extraídos corretamente
    const valorAC = row[ColunaExcel.VALOR_AC] ? row[ColunaExcel.VALOR_AC].toString().trim() : "0";
    const valorAG = row[ColunaExcel.VALOR_AG] ? row[ColunaExcel.VALOR_AG].toString().trim() : "0";
    const valorAD = row[ColunaExcel.VALOR_AD] ? row[ColunaExcel.VALOR_AD].toString().trim() : "0";
    const valorAF = row[ColunaExcel.VALOR_AF] ? row[ColunaExcel.VALOR_AF].toString().trim() : "0";
    const valorAE = row[ColunaExcel.VALOR_AE] ? row[ColunaExcel.VALOR_AE].toString().trim() : "0";
    
    // Converter e formatar os valores
    const desconto = parseFloat(valorAC).toFixed(2).replace('.', ',');
    const taxa = parseFloat(valorAG).toFixed(2).replace('.', ',');
    const juros = (parseFloat(valorAD) + parseFloat(valorAF)).toFixed(2).replace('.', ',');
    const multa = parseFloat(valorAE).toFixed(2).replace('.', ',');
    
    if (codV === "13") {
      // Pagamento via caixa
      results.push(`${localImportacao};${dataFormatada};912;13;${valor};${historicoCompleto}`);
      
      if (desconto !== "0,00") {
        results.push(`${localImportacao};${dataFormatada};13;1111;${desconto};0;Desconto s/ Duplic. N:${histI}-${histG}`);
      }
      
      if (taxa !== "0,00") {
        results.push(`${localImportacao};${dataFormatada};13;1111;${taxa};0;Taxa Administr. N:${histI}-${histG}`);
      }
      
      if (juros !== "0,00") {
        results.push(`${localImportacao};${dataFormatada};1381;13;${juros};0;Pagto Juros s/ Duplic. N:${histI}-${histG}`);
      }
      
      if (multa !== "0,00") {
        results.push(`${localImportacao};${dataFormatada};1383;13;${multa};0;Pagto Multa s/ Duplic. N:${histI}-${histG}`);
      }
    } else {
      if (importLocation === TipoEmpresa.MATRIZ) {
        // Pagamento via banco na matriz
        const bankMapping: { [key: string]: string } = {
          '85': '9085',
          '83': '9083',
          '82': '9082',
          '180': '9180',
          '161': '9161'
        };
        const tabela = bankMapping[codV] || '0000';
        
        results.push(`${localImportacao};${dataFormatada};912;${codV};${valor};${historicoCompleto}`);
        
        if (desconto !== "0,00") {
          results.push(`${localImportacao};${dataFormatada};1111;${codV};${desconto};0;Desconto s/ Duplic. N:${histI}-${histG}`);
        }
        
        if (taxa !== "0,00") {
          results.push(`${localImportacao};${dataFormatada};1111;${codV};${taxa};0;Taxa Administr. N:${histI}-${histG}`);
        }
        
        if (juros !== "0,00") {
          results.push(`${localImportacao};${dataFormatada};1381;${codV};${juros};0;Pagto Juros s/ Duplic. N:${histI}-${histG}`);
        }
        
        if (multa !== "0,00") {
          results.push(`${localImportacao};${dataFormatada};1383;${codV};${multa};0;Pagto Multa s/ Duplic. N:${histI}-${histG}`);
        }
      } else if (importLocation === TipoEmpresa.FILIAL) {
        // Pagamento via banco na filial
        // Lançamento na filial
        results.push(`${localImportacao};${dataFormatada};912;1516;${valor};${historicoCompleto}`);
        
        // Lançamento extra na matriz
        const historicoExtra = `270;${histI}-${histG} ${histAM}`;
        results.push(`0001;${dataFormatada};1513;${codV};${valor};${historicoExtra}`);
        
        // Descontos
        if (desconto !== "0,00") {
          // Na filial
          results.push(`${localImportacao};${dataFormatada};1514;1111;${desconto};0;Desconto s/ Duplic. N:${histI}-${histG}`);
          // Na matriz
          results.push(`0001;${dataFormatada};1515;${codV};${desconto};0;Desconto s/ Duplic. N:${histI}-${histG}`);
        }
        
        // Taxas
        if (taxa !== "0,00") {
          // Na filial
          results.push(`${localImportacao};${dataFormatada};1514;1111;${taxa};0;Taxa Administr. N:${histI}-${histG}`);
          // Na matriz
          results.push(`0001;${dataFormatada};1515;${codV};${taxa};0;Taxa Administr. N:${histI}-${histG}`);
        }
        
        // Juros
        if (juros !== "0,00") {
          // Na filial
          results.push(`${localImportacao};${dataFormatada};1381;1516;${juros};0;Pagto Juros s/ Duplic. N:${histI}-${histG}`);
          // Na matriz
          results.push(`0001;${dataFormatada};1513;${codV};${juros};0;Pagto Juros s/ Duplic. N:${histI}-${histG}`);
        }
        
        // Multas
        if (multa !== "0,00") {
          // Na filial
          results.push(`${localImportacao};${dataFormatada};1383;1516;${multa};0;Pagto Multa s/ Duplic. N:${histI}-${histG}`);
          // Na matriz
          results.push(`0001;${dataFormatada};1513;${codV};${multa};0;Pagto Multa s/ Duplic. N:${histI}-${histG}`);
        }
      }
    }
    
    return results;
  }

  /**
   * Processa despesas bancárias
   * @param {ExcelRow} row - Linha do Excel
   * @returns {string[]} Array de linhas formatadas
   */
  static processarDespesasBancarias(row: ExcelRow): string[] {
    const results: string[] = [];
    const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);
    if (![TipoEmpresa.MATRIZ, TipoEmpresa.FILIAL].includes(importLocation)) return results;
    const localImportacao = MAPA_IMPORT_MAP[importLocation];

    const contaBancaria = row[ColunaExcel.CONTA_BANCARIA]?.toString().trim();
    const dataFormatada = DataFormatter.formatDate(DataFormatter.parseISODateFromRow(row));
    const valor = row[ColunaExcel.VALOR_S] ? parseFloat(row[ColunaExcel.VALOR_S]).toFixed(2) : "0.00";
    const natureza = row[ColunaExcel.NATUREZA]?.toString().trim();

    let contaContabil = "";
    let historicoFixo = "";
    switch(natureza) {
      case "150209":
        contaContabil = "1397";
        historicoFixo = "1277";
        break;
      case "150206":
        contaContabil = "1378";
        historicoFixo = "445";
        break;
      case "140502":
        contaContabil = "1363";
        historicoFixo = "679";
        break;
      case "150210":
        contaContabil = "1393";
        historicoFixo = "459";
        break;
      case "150204":
        contaContabil = "2381";
        historicoFixo = "679";
        break;
      default:
        return results;
    }
    
    let historico = historicoFixo;
    if (historicoFixo === "679") {
      const obs = row[ColunaExcel.HISTORICO_AM] ? DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_AM].toString()) : "";
      if (obs) historico += " " + obs;
    }
    
    results.push(`${localImportacao};${dataFormatada};${contaContabil};${contaBancaria};${valor};${historico};`);

    return results;
  }
}

/**
 * Classe responsável por processar dados fiscais
 * @class FiscalProcessor
 */
class FiscalProcessor {
  /**
   * Processa dados fiscais da regra 326   filesToUpload 
   * @param {ExcelRow[]} rows - Linhas do Excel
   * @param {Map<string, string>} mapeamentoDuplicatas - Mapeamento de duplicatas
   * @returns {Promise<{ linhasFiscais: string[]; duplicatasNaoEncontradas: any[] }>} Resultado do processamento
   */
  static async processarFiscal326(
    rows: ExcelRow[],
    mapeamentoDuplicatas: Map<string, string>
  ): Promise<{ linhasFiscais: string[]; duplicatasNaoEncontradas: any[] }> {
    const linhasFiscais: string[] = [];
    const duplicatasNaoEncontradas: any[] = [];
    
    for (const row of rows) {
      if (Number(row[ColunaExcel.RELATORIO]) !== 326) continue;
      const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);
      if (![TipoEmpresa.MATRIZ, TipoEmpresa.FILIAL].includes(importLocation)) continue;
      
      const tipoTitulo = row[ColunaExcel.TIPO_TITULO]?.toString();
      if ([TipoTitulo.IGNORAR_16, TipoTitulo.IGNORAR_17].includes(tipoTitulo as TipoTitulo)) continue;
      
      const tipoOperacao = row[ColunaExcel.TIPO_OPERACAO]?.toString();
      if (['1660', '16', '17', '1610', '1602', '1152', '1604', '1601'].includes(tipoOperacao)) continue;
      if (IGNORED_NATUREZAS.has(row[ColunaExcel.NATUREZA]?.toString())) continue;
      
      const contaBancaria = row[ColunaExcel.CONTA_BANCARIA]?.toString();
      const dataISO = DataFormatter.parseISODateFromRow(row);
      const dataFormatada = DataFormatter.formatDate(dataISO);
      const duplicataValue = row[ColunaExcel.DUPLICATA] ? row[ColunaExcel.DUPLICATA].toString().trim() : '';
      
      const notaFiscalKey = row[ColunaExcel.HISTORICO_I] ? row[ColunaExcel.HISTORICO_I].toString().trim() : 'N/D';
      const dupInfo = JSON.parse(mapeamentoDuplicatas.get(notaFiscalKey) || '{}');
      const chaveDuplicata = dupInfo.chaveDuplicata || '';
      const valorColunaF = dupInfo.valorColunaF || notaFiscalKey;
      
      if (!chaveDuplicata) {
        duplicatasNaoEncontradas.push({
          'Código': MAPA_IMPORT_MAP[importLocation] || '',
          'Fornecedor/Cliente': row[ColunaExcel.HISTORICO_G]?.toString() || '',
          'Duplicata': notaFiscalKey,
          'Data': dataFormatada,
          'Valor Bruto': row[ColunaExcel.VALOR_O] ? parseFloat(row[ColunaExcel.VALOR_O]).toFixed(2) : "0.00",
          'Valor Líquido': row[ColunaExcel.VALOR_S] ? parseFloat(row[ColunaExcel.VALOR_S]).toFixed(2) : "0.00",
          'Banco': contaBancaria || '',
          'Observação': 'Duplicata não consta no arquivo de duplicatas em aberto'
        });
        console.log(`🔴 Duplicata não encontrada no mapeamento: ${notaFiscalKey}`);
        continue;
      }
      
      // Extrair e calcular valores
      const valorBase = row[ColunaExcel.VALOR_O] ? parseFloat(row[ColunaExcel.VALOR_O].toString()) : 0;
      const valorAC = row[ColunaExcel.VALOR_AC] ? parseFloat(row[ColunaExcel.VALOR_AC].toString()) : 0;
      const valorAD = row[ColunaExcel.VALOR_AD] ? parseFloat(row[ColunaExcel.VALOR_AD].toString()) : 0;
      const valorAE = row[ColunaExcel.VALOR_AE] ? parseFloat(row[ColunaExcel.VALOR_AE].toString()) : 0;
      const valorAF = row[ColunaExcel.VALOR_AF] ? parseFloat(row[ColunaExcel.VALOR_AF].toString()) : 0;
      const valorAG = row[ColunaExcel.VALOR_AG] ? parseFloat(row[ColunaExcel.VALOR_AG].toString()) : 0;
      
      // Formatar o valor base (coluna O)
      const valorBaseFormatado = valorBase.toFixed(2).replace('.', ',');
      
      // Calcular valores adicionais
      const valorDesconto = valorAC.toFixed(2).replace('.', ',');
      const valorJuros = (valorAD + valorAF + valorAG).toFixed(2).replace('.', ',');
      const valorMulta = valorAE.toFixed(2).replace('.', ',');
      
      let tabelaFiscal = "";
      if (contaBancaria === '13') {
        tabelaFiscal = '483';
      } else if (importLocation === TipoEmpresa.MATRIZ) {
        const bankMapping: { [key: string]: string } = {
          '85': '9085',
          '83': '9083',
          '82': '9082',
          '180': '9180',
          '161': '9161'
        };
        tabelaFiscal = bankMapping[contaBancaria] || '0000';
      } else {
        tabelaFiscal = '9516';
      }
      
      const tipoEmpresaFiscal = importLocation === TipoEmpresa.MATRIZ ? '1' : '2';
      
      // Adicionar linha fiscal com o valor base
      const linhaUnica = [
        tipoEmpresaFiscal,
        '1',
        chaveDuplicata,
        '001',
        dataFormatada,
        dataFormatada,
        duplicataValue,
        valorBaseFormatado,
        valorJuros,
        tabelaFiscal,
        valorColunaF,
        valorDesconto,
        valorMulta
      ].join(';');

      linhasFiscais.push(linhaUnica);
    }
    
    linhasFiscais.sort((a, b) => {
      const fieldsA = a.split(';');
      const fieldsB = b.split(';');
      const [dA, mA, yA] = fieldsA[4].split('/');
      const [dB, mB, yB] = fieldsB[4].split('/');
      return new Date(Number(`20${yA}`), Number(mA) - 1, Number(dA)).getTime() -
             new Date(Number(`20${yB}`), Number(mB) - 1, Number(dB)).getTime();
    });
    
    console.log(`Total de linhas fiscais processadas: ${linhasFiscais.length}`);
    console.log(`Total de duplicatas não encontradas: ${duplicatasNaoEncontradas.length}`);
    return { linhasFiscais, duplicatasNaoEncontradas };
  }
}

/**
 * Classe principal que orquestra o processamento da regra 326
 * @class Processador326
 */
class Processador326 {
  /**
   * Processa o arquivo da regra 326
   * @param {string} inputExcelPath - Caminho do arquivo de entrada
   * @param {string} duplicatasPath - Caminho do arquivo de duplicatas
   * @param {string} outputContabilPath - Caminho do arquivo contábil de saída
   * @param {string} outputFiscalPath - Caminho do arquivo fiscal de saída
   * @param {string} outputDuplicatasPath - Caminho do arquivo de duplicatas não encontradas
   * @returns {Promise<void>}
   */
  static async processarArquivo326(
    inputExcelPath: string,
    duplicatasPath: string,
    outputContabilPath: string,
    outputFiscalPath: string,
    outputDuplicatasPath: string
  ): Promise<void> {
    try {
      console.log('Iniciando processamento da Regra 326 (MAPA)...');
      const mapeamentoDuplicatas = await DuplicataProcessor.carregarMapeamentoDuplicatas(duplicatasPath);
      const rows = await ExcelProcessor.readExcelFile(inputExcelPath);
      
      const contabilOutput = this.processarContabil326(rows);
      this.exportToTxt(contabilOutput, outputContabilPath);
      console.log(`Arquivo Contábil gerado em: ${outputContabilPath}`);
      
      const { linhasFiscais, duplicatasNaoEncontradas } = await FiscalProcessor.processarFiscal326(rows, mapeamentoDuplicatas);
      this.exportToTxt(linhasFiscais, outputFiscalPath);
      console.log(`Arquivo Fiscal gerado em: ${outputFiscalPath}`);
      
      await ExcelProcessor.exportToExcel(duplicatasNaoEncontradas, outputDuplicatasPath);
      console.log(`Arquivo de Duplicatas não encontradas gerado em: ${outputDuplicatasPath}`);
      console.log('Processamento concluído com sucesso!');
    } catch (error) {
      console.error('Erro durante o processamento da Regra 326:', error);
      throw error;
    }
  }

  /**
   * Processa dados contábeis da regra 326
   * @param {ExcelRow[]} rows - Linhas do Excel
   * @returns {string[]} Array de linhas contábeis processadas
   */
  private static processarContabil326(rows: ExcelRow[]): string[] {
    const output: string[] = [];
    for (const row of rows) {
      if (Number(row[ColunaExcel.RELATORIO]) !== 326) continue;
      const importLocation = Number(row[ColunaExcel.IMPORT_LOCATION]);
      if (![TipoEmpresa.MATRIZ, TipoEmpresa.FILIAL].includes(importLocation)) continue;
      
      const tipoOperacao = row[ColunaExcel.TIPO_OPERACAO]?.toString();
      if (IGNORED_OPERACOES.has(tipoOperacao)) {
        console.log(`Linha ignorada - Tipo de Operação: ${tipoOperacao}`);
        continue;
      }
      
      const natureza = row[ColunaExcel.NATUREZA]?.toString();
      if (IGNORED_NATUREZAS.has(natureza)) continue;
      
      const tipoTitulo = row[ColunaExcel.TIPO_TITULO]?.toString();
      if ([TipoTitulo.IGNORAR_16, TipoTitulo.IGNORAR_17].includes(tipoTitulo as TipoTitulo)) continue;
      
      if (tipoOperacao === TipoOperacao.ADIANTAMENTO_FORNECEDORES) {
        output.push(...LancamentoProcessor.processarAdiantamentoFornecedores(row));
      } else if (tipoOperacao === TipoOperacao.ENERGIA_ELETRICA) {
        output.push(...EnergiaDespesasProcessor.processarEnergia(row));
      } else if (tipoOperacao === TipoOperacao.DESPESAS_BANCARIAS) {
        output.push(...EnergiaDespesasProcessor.processarDespesasBancarias(row));
      } else if ([TipoOperacao.DESPESAS_DIVERSAS_1, TipoOperacao.DESPESAS_DIVERSAS_2].includes(tipoOperacao as TipoOperacao)) {
        output.push(...LancamentoProcessor.processarDespesasDiversas(row));
      } else {
        const contaBancaria = row[ColunaExcel.CONTA_BANCARIA]?.toString();
      
        const isFilial = [TipoEmpresa.FILIAL].includes(importLocation);
        const isBanco = contaBancaria !== '13';
      
        if (isFilial && isBanco) {
          // Lançamento extra na matriz
          const dataISO = DataFormatter.parseISODateFromRow(row);
          const dataFormatada = DataFormatter.formatDate(dataISO);
          const valor = row[ColunaExcel.VALOR_S] ? parseFloat(row[ColunaExcel.VALOR_S]).toFixed(2) : '0.00';
      
          const histI = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_I]?.toString() || '');
          const histG = DataFormatter.normalizeText(row[ColunaExcel.HISTORICO_G]?.toString() || '');
      
          const contaDebito = getExtraAccount(importLocation); // Conta contábil da filial
          const contaCredito = contaBancaria; // Banco
          const historico = `270;${histI} - ${histG}`;
      
          output.push(`0001;${dataFormatada};${contaDebito};${contaCredito};${valor};${historico}`);
        }
      }
    }
    
    output.sort((a, b) => {
      const [, dateA] = a.split(';');
      const [, dateB] = b.split(';');
      const [dA, mA, yA] = dateA.split('/');
      const [dB, mB, yB] = dateB.split('/');
      const timeA = new Date(Number(`20${yA}`), Number(mA) - 1, Number(dA)).getTime();
      const timeB = new Date(Number(`20${yB}`), Number(mB) - 1, Number(dB)).getTime();
      return timeA - timeB;
    });
    
    console.log(`Total de linhas contábeis processadas: ${output.length}`);
    return output;
  }

  /**
   * Exporta dados para um arquivo de texto
   * @param {string[]} data - Dados a serem exportados
   * @param {string} outputPath - Caminho de saída do arquivo
   * @returns {void}
   */
  private static exportToTxt(data: string[], outputPath: string): void {
    const content = data.length > 0
      ? data.join('\r\n') + '\r\n'
      : 'Arquivo gerado automaticamente, mas sem dados válidos.\r\n';
      
    fs.writeFileSync(outputPath, content, { encoding: 'utf8' });
    console.log(`📝 Arquivo 289 exportado: ${outputPath} (${data.length} linhas)`);
  }
}

/* ===================================================
   EXPORTAÇÃO
   =================================================== */
export { Processador326 };
