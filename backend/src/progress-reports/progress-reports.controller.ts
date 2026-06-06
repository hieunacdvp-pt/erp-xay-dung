import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProgressReportsService } from './progress-reports.service';

@Controller('progress-reports')
export class ProgressReportsController {
  constructor(private readonly progressReportsService: ProgressReportsService) {}

  @Post()
  create(@Body() createProgressReportDto: any) {
    return this.progressReportsService.create(createProgressReportDto);
  }

  @Get()
  findAll() {
    return this.progressReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.progressReportsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() data: any) {
    return this.progressReportsService.remove(+id, data?.username);
  }
}
