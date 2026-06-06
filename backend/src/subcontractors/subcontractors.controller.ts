import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubcontractorsService } from './subcontractors.service';
import { CreateSubcontractorDto } from './dto/create-subcontractor.dto';
import { UpdateSubcontractorDto } from './dto/update-subcontractor.dto';

@Controller('subcontractors')
export class SubcontractorsController {
  constructor(private readonly subcontractorsService: SubcontractorsService) {}

  @Post()
  create(@Body() createSubcontractorDto: CreateSubcontractorDto) {
    return this.subcontractorsService.create(createSubcontractorDto);
  }

  @Get()
  findAll() {
    return this.subcontractorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcontractorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubcontractorDto: UpdateSubcontractorDto) {
    return this.subcontractorsService.update(+id, updateSubcontractorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcontractorsService.remove(+id);
  }
}
