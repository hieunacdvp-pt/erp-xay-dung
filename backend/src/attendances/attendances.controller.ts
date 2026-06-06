import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  createOrUpdate(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendancesService.createOrUpdate(createAttendanceDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string, @Query('date') date?: string) {
    if (projectId && date) {
      return this.attendancesService.findByProjectAndDate(+projectId, date);
    }
    return this.attendancesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendancesService.remove(+id);
  }

  // --- PAYROLL ENDPOINTS ---

  @Get('payroll')
  getPayroll(@Query('projectId') projectId: string, @Query('month') month: string) {
    if (!projectId || !month) return [];
    return this.attendancesService.getPayroll(+projectId, month);
  }

  @Get('payroll/summary')
  getPayrollSummary(@Query('month') month: string) {
    if (!month) return [];
    return this.attendancesService.getPayrollSummary(month);
  }

  @Post('payroll/:id')
  savePayslip(@Param('id') id: string, @Body() data: any) {
    return this.attendancesService.savePayslip(+id, data);
  }

  @Post('payroll/account')
  accountPayroll(@Body() body: { projectId: number, month: string }) {
    return this.attendancesService.accountPayroll(body.projectId, body.month);
  }

  @Post('payroll/pay')
  payPayroll(@Body() body: { projectId: number, month: string, accountId: number }) {
    return this.attendancesService.payPayroll(body.projectId, body.month, body.accountId);
  }
}
