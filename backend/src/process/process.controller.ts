import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Body,
  Get,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessingLogService } from './processing-log.service';
import { DownloadsService } from '../downloads/downloads.service';
import { Response } from 'express';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { createEmpresaProcessor } from 'src/strategies/EmpresaProcessorFactory';
import { MapaProcessor } from 'src/strategies/MapaProcessor';

@Controller('process')
export class ProcessController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly processingLogService: ProcessingLogService,
    private readonly supabaseService: SupabaseService,
    private readonly downloadsService: DownloadsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('codigoSistema') codigoSistema: string,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
    }

    try {
      const empresa = await this.prisma.empresa.findUnique({ where: { codigoSistema } });
      if (!empresa) {
        return res.status(400).json({ message: 'Empresa não encontrada.' });
      }

      const processor = createEmpresaProcessor(codigoSistema, this.supabaseService);
      const isUnified = file.originalname.toLowerCase().includes('unificado') ||
                         file.originalname.toLowerCase().endsWith('.xlsx');

      const outputDir = path.join(__dirname, '../../uploads', codigoSistema, 'saida');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      let result;
      if (isUnified) {
        result = await processor.processUnificado(
          file.path,
          outputDir,
          codigoSistema,
          this.supabaseService,
        );
      } else {
        result = await processor.processPagamentos(
          file.path,
          outputDir,
          codigoSistema,
          this.supabaseService,
        );
      }

      return res.json({
        message: 'Arquivo processado e enviado com sucesso!',
        processedFiles: result,
      });
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      return res.status(500).json({ message: 'Erro ao processar o arquivo.', error });
    }
  }

  @Get('download/:codigoSistema/:filename')
  async downloadFile(
    @Param('codigoSistema') codigoSistema: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // 1) obtenha a URL assinada
      const supabasePath = `arquivos/${codigoSistema}/${filename}`;
      const fileUrl = await this.supabaseService.getSignedFileUrl(supabasePath);
      if (!fileUrl) {
        return res.status(404).json({ message: 'Arquivo não encontrado no Supabase.' });
      }

      // 2) registre o download
      await this.downloadsService.logDownload({
        filename,
        company: codigoSistema,
        category: 'process',
        user: 'guest',
      });

      // 3) obtenha o stream via Axios
      const axiosRes = await axios.get<import('stream').Readable>(fileUrl, {
        responseType: 'stream',
      });

      // 4) propague headers de download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader(
        'Content-Type',
        axiosRes.headers['content-type'] || 'application/octet-stream',
      );

      // 5) pipe do stream direto para o cliente
      return axiosRes.data.pipe(res);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      return res.status(500).json({ message: 'Erro ao baixar arquivo.' });
    }
  }

  @Get('logs')
  async getProcessingLogs() {
    return this.processingLogService.getAllLogs();
  }

  @Post('upload289')
  @UseInterceptors(FilesInterceptor('files', 2, { dest: './uploads' }))
  async uploadRegra289(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('codigoSistema') codigoSistema: string,
    @Res() res: Response,
  ) {
    if (!files || files.length < 2) {
      return res.status(400).json({ message: 'Envie os arquivos de pagamentos e duplicatas.' });
    }

    const pagamentosFile = files.find(
      file => file.originalname.toLowerCase().includes('289') &&
              !file.originalname.toLowerCase().includes('duplicata'),
    );
    const duplicatasFile = files.find(
      file => file.originalname.toLowerCase().includes('duplicata'),
    );

    if (!pagamentosFile || !duplicatasFile) {
      return res.status(400).json({ message: 'Não foi possível identificar os arquivos corretamente.' });
    }

    const outputDir = path.join(__dirname, '../../uploads', codigoSistema, 'saida', '289');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const processor = createEmpresaProcessor(codigoSistema, this.supabaseService);
    if (typeof (processor as MapaProcessor).processRegra289 !== 'function') {
      return res.status(400).json({ message: 'Empresa não suporta a regra 289.' });
    }

    try {
      const processedFiles = await (processor as MapaProcessor).processRegra289(
        pagamentosFile.path,
        duplicatasFile.path,
        outputDir,
        codigoSistema,
      );

      return res.json({ message: 'Regra 289 processada com sucesso!', processedFiles });
    } catch (error) {
      console.error('Erro ao processar a regra 289:', error);
      return res.status(500).json({ message: 'Erro ao processar a regra 289.', error });
    }
  }

  @Post('upload326')
  @UseInterceptors(FilesInterceptor('files', 2, { dest: './uploads' }))
  async uploadRegra326(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('codigoSistema') codigoSistema: string,
    @Res() res: Response,
  ) {
    if (!files || files.length < 2) {
      return res.status(400).json({ message: 'Envie os arquivos de pagamentos e duplicatas.' });
    }

    const pagamentosFile = files.find(
      file => file.originalname.toLowerCase().includes('326') &&
              !file.originalname.toLowerCase().includes('duplicata'),
    );
    const duplicatasFile = files.find(
      file => file.originalname.toLowerCase().includes('duplicata'),
    );

    if (!pagamentosFile || !duplicatasFile) {
      return res.status(400).json({ message: 'Não foi possível identificar os arquivos corretamente.' });
    }

    const outputDir = path.join(__dirname, '../../uploads', codigoSistema, 'saida', '326');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const processor = createEmpresaProcessor(codigoSistema, this.supabaseService);
    if (typeof (processor as MapaProcessor).processRegra326 !== 'function') {
      return res.status(400).json({ message: 'Empresa não suporta a regra 326.' });
    }

    try {
      const processedFiles = await (processor as MapaProcessor).processRegra326(
        pagamentosFile.path,
        duplicatasFile.path,
        outputDir,
        codigoSistema,
      );

      return res.json({ message: 'Regra 326 processada com sucesso!', processedFiles });
    } catch (error) {
      console.error('Erro ao processar a regra 326:', error);
      return res.status(500).json({ message: 'Erro ao processar a regra 326.', error });
    }
  }
}
