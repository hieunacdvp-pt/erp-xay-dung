import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubcontractsService } from './subcontracts.service';

@Controller('subcontracts')
export class SubcontractsController {
  constructor(private readonly subcontractsService: SubcontractsService) {}

  @Post()
  create(@Body() data: any) {
    return this.subcontractsService.create(data);
  }

  @Get()
  findAll() {
    return this.subcontractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcontractsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.subcontractsService.update(+id, data);
  }

  @Post(':id/acceptances')
  createAcceptance(@Param('id') id: string, @Body() data: any) {
    return this.subcontractsService.createAcceptance(+id, data);
  }
}
