import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('pnl')
  getPnL(
    @Query('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (projectId) {
      return this.reportsService.getProjectPnL(Number(projectId), startDate, endDate);
    }
    return this.reportsService.getAllProjectsPnL(startDate, endDate);
  }

  @Get('tax-excel')
  async getTaxExcel(
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: any
  ) {
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.reportsService.getTaxExcel(res, m, y);
  }
}
