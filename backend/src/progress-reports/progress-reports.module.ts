import { Module } from '@nestjs/common';
import { ProgressReportsService } from './progress-reports.service';
import { ProgressReportsController } from './progress-reports.controller';

@Module({
  controllers: [ProgressReportsController],
  providers: [ProgressReportsService],
})
export class ProgressReportsModule {}
