import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    file: Express.Multer.File,
    codigoSistema: string,
  ): Promise<string> {
    const fileName = `${Date.now()}_${file.originalname}`;
    const supabasePath = `arquivos/${codigoSistema}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('uploads')
      .upload(supabasePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(`Erro ao enviar arquivo: ${error.message}`);
    }

    return supabasePath;
  }

  async getSignedFileUrl(supabasePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('uploads')
      .createSignedUrl(supabasePath, 60 * 60); // URL válida por 1h

    if (error || !data.signedUrl) {
      throw new Error(`Erro ao gerar Signed URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async uploadProcessedFile(
    filePath: string,
    fileBuffer: Buffer,
    codigoSistema: string,
  ) {
    try {
      const originalFileName = path.basename(filePath);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${originalFileName}`;
      const supabasePath = `arquivos/${codigoSistema}/${fileName}`;

      console.log(`Enviando arquivo -> ${supabasePath}`);

      const { data, error } = await this.supabase.storage
        .from('uploads')
        .upload(supabasePath, fileBuffer, {
          contentType: 'text/plain',
        });

      if (error) {
        console.error(`Erro ao enviar arquivo ${fileName}:`, error);
        return { error };
      }

      return { data, supabasePath };
    } catch (error) {
      console.error('Erro inesperado ao fazer upload do arquivo:', error);
      return { error };
    }
  }
}
