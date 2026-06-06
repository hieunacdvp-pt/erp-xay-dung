import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.equipmentService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.equipmentService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equipmentService.delete(+id);
  }

  // --- Dispatches ---
  @Get('dispatches')
  findAllDispatches() {
    return this.equipmentService.findAllDispatches();
  }

  @Post('dispatches')
  createDispatch(@Body() data: any) {
    // Convert dates if necessary
    data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.equipmentService.createDispatch(data);
  }

  @Patch('dispatches/:id')
  updateDispatch(@Param('id') id: string, @Body() data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.equipmentService.updateDispatch(+id, data);
  }

  @Delete('dispatches/:id')
  removeDispatch(@Param('id') id: string) {
    return this.equipmentService.deleteDispatch(+id);
  }

  // --- Usages ---
  @Get('usages')
  findAllUsages() {
    return this.equipmentService.findAllUsages();
  }

  @Post('usages')
  createUsage(@Body() data: any) {
    return this.equipmentService.createUsage(data);
  }

  @Patch('usages/:id')
  updateUsage(@Param('id') id: string, @Body() data: any) {
    return this.equipmentService.updateUsage(+id, data);
  }

  @Post('usages/:id/approve')
  approveUsage(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.equipmentService.approveUsage(+id, approvedBy || 'SYSTEM');
  }

  @Delete('usages/:id')
  removeUsage(@Param('id') id: string) {
    return this.equipmentService.deleteUsage(+id);
  }
}
