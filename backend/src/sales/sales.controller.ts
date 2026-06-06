import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('invoices')
  getInvoices(@Query('projectId') projectId: string) {
    return this.salesService.getInvoices(projectId ? Number(projectId) : undefined);
  }

  @Post('invoices')
  createInvoice(@Body() data: any) {
    return this.salesService.createInvoice(data);
  }
}
