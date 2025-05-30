import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],           
  providers: [
    PrismaService,           
    DownloadsService,
  ],
  controllers: [DownloadsController],
  exports: [DownloadsService],
})
export class DownloadsModule {}
