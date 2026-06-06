import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ProcurementService } from './procurement.service';

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post('pr')
  createPR(@Body() data: any) {
    return this.procurementService.createPR(data);
  }

  @Get('pr')
  findAllPRs() {
    return this.procurementService.findAllPRs();
  }

  @Patch('pr/:id/approve/:level')
  approvePR(@Param('id') id: string, @Param('level') level: string) {
    return this.procurementService.approvePR(+id, level);
  }

  @Patch('pr/:id')
  updatePR(@Param('id') id: string, @Body() data: any) {
    return this.procurementService.updatePR(+id, data);
  }

  @Delete('pr/:id')
  deletePR(@Param('id') id: string) {
    return this.procurementService.deletePR(+id);
  }

  @Post('po')
  createPO(@Body() data: any) {
    return this.procurementService.createPO(data);
  }

  @Get('po')
  findAllPOs() {
    return this.procurementService.findAllPOs();
  }

  @Patch('po/:id/approve/:level')
  approvePO(@Param('id') id: string, @Param('level') level: string) {
    return this.procurementService.approvePO(+id, level);
  }

  @Patch('po/:id')
  updatePO(@Param('id') id: string, @Body() data: any) {
    return this.procurementService.updatePO(+id, data);
  }

  @Delete('po/:id')
  deletePO(@Param('id') id: string) {
    return this.procurementService.deletePO(+id);
  }

  @Post('po/:id/receive')
  receivePO(@Param('id') id: string, @Body() body: { invoiceNumber?: string }) {
    return this.procurementService.receivePO(+id, body?.invoiceNumber);
  }
}
