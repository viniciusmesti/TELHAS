import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessingLogService } from './processing-log.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports: [SupabaseModule], 
  providers: [ProcessService, PrismaService, ProcessingLogService, SupabaseService],
  controllers: [ProcessController],
})
export class ProcessModule {}
