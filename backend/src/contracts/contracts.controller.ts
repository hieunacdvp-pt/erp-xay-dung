import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() createContractDto: any) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDto: any) {
    return this.contractsService.update(+id, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(+id);
  }

  // --- MILESTONES ---
  @Patch('milestones/:id/status')
  updateMilestoneStatus(@Param('id') id: string, @Body() body: any) {
    return this.contractsService.updateMilestoneStatus(+id, body);
  }

  // --- GUARANTEE LETTERS ---
  @Post(':id/guarantee-letters')
  addGuaranteeLetter(@Param('id') contractId: string, @Body() data: any) {
    return this.contractsService.addGuaranteeLetter(+contractId, data);
  }

  @Patch('guarantee-letters/:id')
  updateGuaranteeLetter(@Param('id') id: string, @Body() data: any) {
    return this.contractsService.updateGuaranteeLetter(+id, data);
  }

  @Delete('guarantee-letters/:id')
  removeGuaranteeLetter(@Param('id') id: string) {
    return this.contractsService.removeGuaranteeLetter(+id);
  }
}
