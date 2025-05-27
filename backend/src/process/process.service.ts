import { Injectable } from '@nestjs/common';
import { readExcelFile } from '../utils'; 
import { transformarRegra255 } from '../Regras/MAPA/255/transformarRegra255';
import { exportToTxt } from '../Regras/MAPA/255/processarArquivo255';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessingLogService } from './processing-log.service';

@Injectable()
export class ProcessService {
  constructor(
    private prisma: PrismaService,
    private processingLogService: ProcessingLogService,
  ) {}

  async processFile(inputExcelPath: string, outputTxtPath: string, processId: string): Promise<void> {
    try {
      console.log('📂 Lendo o arquivo Excel...');
      const rows = await readExcelFile(inputExcelPath);
      console.log(`📊 Total de linhas lidas: ${rows.length}`);

      console.log('🔄 Transformando os dados...');
      // Aqui usamos transformarRegra255 para obter o array de lançamentos
      const transformedData = transformarRegra255(rows);

      console.log('📤 Exportando os dados para TXT...');
      exportToTxt(transformedData, outputTxtPath);

      // Salva log de sucesso no banco
      await this.processingLogService.createLog(
        inputExcelPath,
        outputTxtPath,
        'Success',
        processId,
      );

      // Atualiza o status do processamento
      await this.prisma.process.update({
        where: { id: processId },
        data: { status: 'concluído' },
      });

      console.log('✅ Processo concluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao processar o arquivo:', error);

      // Registrar erro no log
      await this.processingLogService.createLog(inputExcelPath, outputTxtPath, 'Error', error.message);

      // Atualiza o status para erro
      await this.prisma.process.update({
        where: { id: processId },
        data: { status: 'erro', erro: error.message },
      });

      throw new Error('Erro ao processar o arquivo.');
    }
  }
}
