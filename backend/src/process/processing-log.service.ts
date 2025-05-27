import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProcessingLogService {
  constructor(private prisma: PrismaService) {}

  async createLog(
    fileUrl: string,
    outputFileName: string,
    status: string,
    processId: string,
    message?: string,
  ) {
    return await this.prisma.processingLog.create({
      data: {
        fileUrl,
        outputFileName,
        status,
        message,
        process: {
          connect: {
            id: processId, // Passando o processId dinâmico
          },
        },
      },
    });
  }

  async getAllLogs() {
    return this.prisma.processingLog.findMany({
      orderBy: { processedAt: 'desc' },
    });
  }
}
