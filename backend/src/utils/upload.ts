import * as fs from 'fs';
import { SupabaseService } from '../supabase/supabase.service';

export interface ProcessedInfo {
  path: string;
  size: number;
}

export async function uploadIfNotEmpty(
  supabaseService: SupabaseService,
  key: string,
  filePath: string,
  codigoSistema: string,
  result: Record<string, ProcessedInfo>,
): Promise<void> {
  const stats = fs.statSync(filePath);
  if (stats.size > 0) {
    const fileBuffer = fs.readFileSync(filePath);
    const { supabasePath, error } = await supabaseService.uploadProcessedFile(
      filePath,
      fileBuffer,
      codigoSistema,
    );
    result[key] = {
      path: supabasePath,
      size: stats.size,
    };
  } else {
    fs.unlinkSync(filePath);
  }
}
