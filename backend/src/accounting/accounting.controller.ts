import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('trial-balance')
  getTrialBalance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getTrialBalance(startDate, endDate);
  }

  @Get('general-ledger')
  getGeneralLedger(
    @Query('accountCode') accountCode: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.accountingService.getGeneralLedger(
      accountCode,
      startDate,
      endDate,
      projectId ? Number(projectId) : undefined,
    );
  }

  @Get('pnl')
  getPnl(
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getPnl(
      projectId ? Number(projectId) : undefined,
      startDate,
      endDate
    );
  }
}
