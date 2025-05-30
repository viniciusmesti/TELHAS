import {
    Controller,
    Get,
    Delete,
    Query,
    Param,
    Body,
    Post,
  } from '@nestjs/common';
  import { DownloadsService } from './downloads.service';
  
  @Controller('api/downloads/history')
  export class DownloadsController {
    constructor(private svc: DownloadsService) {}
  
    @Get()
    getAll() {
      return this.svc.findAll();
    }
  
    @Delete(':id')
    async removeOne(@Param('id') id: string) {
      await this.svc.deleteOne(id);
      return { success: true };
    }
  
    @Delete()
    async removeMany(@Query('ids') ids: string) {
      await this.svc.deleteMany(ids.split(','));
      return { success: true };
    }
  }
  