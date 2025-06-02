import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DownloadsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.downloadHistory.findMany({ orderBy: { createdAt: 'desc' } });
  }
  deleteOne(id: string) {
    return this.prisma.downloadHistory.delete({ where: { id } });
  }
  deleteMany(ids: string[]) {
    return this.prisma.downloadHistory.deleteMany({ where: { id: { in: ids } } });
  }
  logDownload(data: { filename: string; company: string; category: string; user: string; }) {
    return this.prisma.downloadHistory.create({ data });
  }
}
