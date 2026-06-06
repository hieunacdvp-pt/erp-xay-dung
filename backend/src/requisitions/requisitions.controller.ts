import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitionsService } from './requisitions.service';

@Controller('requisitions')
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Post()
  create(@Body() createRequisitionDto: any) {
    return this.requisitionsService.create(createRequisitionDto);
  }

  @Get()
  findAll() {
    return this.requisitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitionsService.findOne(+id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() data: any) {
    return this.requisitionsService.approve(+id, data.username);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() data: any) {
    return this.requisitionsService.reject(+id, data.username);
  }

  @Patch(':id/fulfill')
  fulfill(@Param('id') id: string, @Body() data: any) {
    return this.requisitionsService.fulfill(+id, data);
  }
}
