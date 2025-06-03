import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      // Total de uploads (logs de processamento)
      const totalUploads = await this.prisma.processingLog.count();

      // Total de downloads
      const totalDownloads = await this.prisma.downloadHistory.count();

      // Empresas ativas
      const empresasAtivas = await this.prisma.empresa.count();

      // Último upload - busca o log mais recente com informações da empresa
      const ultimoUploadLog = await this.prisma.processingLog.findFirst({
        orderBy: {
          processedAt: 'desc'
        },
        include: {
          process: {
            include: {
              empresa: true
            }
          }
        }
      });

      const ultimoUpload = ultimoUploadLog ? {
        processedAt: ultimoUploadLog.processedAt.toISOString(),
        empresa: ultimoUploadLog.process.empresa.nome,
        filename: ultimoUploadLog.outputFileName
      } : null;

      return {
        totalUploads,
        totalDownloads,
        empresasAtivas,
        ultimoUpload
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  }
}