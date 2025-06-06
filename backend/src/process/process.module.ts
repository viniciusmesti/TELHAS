import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { ProcessingLogService } from './processing-log.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { DownloadsModule } from '../downloads/downloads.module';
import { PrismaModule } from 'prisma/prisma.module';
import { DownloadsService } from '../downloads/downloads.service';

@Module({
  imports: [
    SupabaseModule,
    PrismaModule,
    DownloadsModule,
  ],
  providers: [
    ProcessService,
    ProcessingLogService,
    DownloadsService,
  ],
  controllers: [ProcessController],
})
export class ProcessModule {}
