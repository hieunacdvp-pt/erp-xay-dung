import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';

@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly service: EnterpriseService) {}

  @Get('settings')
  getSettings() { return { valuationMethod: this.service.getValuationMethod() }; }

  @Post('settings')
  setSettings(@Body('valuationMethod') method: 'AVERAGE' | 'FIFO') { return this.service.setValuationMethod(method); }

  @Get('vendors')
  getVendors() { return this.service.getVendors(); }

  @Post('vendors')
  createVendor(@Body() body: any) { return this.service.createVendor(body); }

  @Patch('vendors/:id')
  updateVendor(@Param('id') id: string, @Body() body: any) { return this.service.updateVendor(+id, body); }

  @Get('debts')
  getDebts() { return this.service.getDebts(); }

  @Post('debts')
  createDebt(@Body() body: any) { return this.service.createDebt(body); }

  @Patch('debts/:id/pay')
  payDebt(
    @Param('id') id: string, 
    @Body('amount') amount: number,
    @Body('accountId') accountId: number,
    @Body('bankFee') bankFee: number,
  ) { 
    return this.service.payDebt(+id, amount, accountId, bankFee); 
  }

  @Post('sales')
  recordSales(@Body() body: { customerId: number, amount: number, note?: string }) {
    return this.service.recordSales(body);
  }

  @Get('movements')
  getMovements() { return this.service.getMovements(); }

  @Post('movements')
  createMovement(@Body() body: any) { return this.service.createMovement(body); }

  @Get('accounts')
  getAccounts() { return this.service.getAccounts(); }

  @Get('journals')
  getJournalEntries() { return this.service.getJournalEntries(); }

  @Get('trial-balance')
  getTrialBalance() { return this.service.getTrialBalance(); }
}
