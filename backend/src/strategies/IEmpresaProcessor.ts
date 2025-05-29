import { SupabaseService } from 'src/supabase/supabase.service';

export interface IEmpresaProcessor {
  processUnificado(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabaseService: SupabaseService,
  ): Promise<Record<string, { path: string; size: number }>>;

  processPagamentos(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
    supabaseService: SupabaseService,
  ): Promise<{ [key: string]: string }>;

  processRecebimentos?(
    inputExcelPath: string,
    outputDir: string,
    codigoSistema: string,
  ): Promise<{ [key: string]: string }>;
}
