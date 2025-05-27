import { IEmpresaProcessor } from './IEmpresaProcessor';
import { MapaProcessor } from './MapaProcessor';
import { NpProcessor } from './NpProcessor';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TelhacoProcessor } from './TelhacoProcessor';
import { TelhasProcessor } from './TelhasProcessor';

export function createEmpresaProcessor(
  codigoSistema: string,
  supabaseService: SupabaseService,
): IEmpresaProcessor {
  switch (codigoSistema) {
    case 'MAPA':
    case '999':
      return new MapaProcessor(supabaseService);

    case 'N&P':
    case '000':
      return new NpProcessor(supabaseService);

    case 'TELHAÇO':
    case '111':
      return new TelhacoProcessor(supabaseService);

    case 'TELHAS':
    case '222':
      return new TelhasProcessor(supabaseService);

    default:
      throw new Error(`Empresa não suportada: ${codigoSistema}`);
  }
}
