import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';

@Injectable()
export class ProgressReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditlogsService
  ) {}

  async create(createProgressReportDto: any) {
    const report = await this.prisma.progressReport.create({
      data: {
        projectId: createProgressReportDto.projectId,
        reporterId: createProgressReportDto.reporterId,
        date: createProgressReportDto.date ? new Date(createProgressReportDto.date) : new Date(),
        weather: createProgressReportDto.weather,
        content: createProgressReportDto.content,
        imageUrls: createProgressReportDto.imageUrls ? JSON.stringify(createProgressReportDto.imageUrls) : null
      }
    });
    await this.auditLogs.log('CREATE', 'ProgressReport', report.id, report, undefined, createProgressReportDto.username);
    return report;
  }

  async findAll() {
    return this.prisma.progressReport.findMany({
      include: {
        project: true,
        reporter: true
      },
      orderBy: { date: 'desc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.progressReport.findUnique({
      where: { id },
      include: {
        project: true,
        reporter: true
      }
    });
  }

  async remove(id: number, username: string) {
    const report = await this.prisma.progressReport.delete({
      where: { id }
    });
    await this.auditLogs.log('DELETE', 'ProgressReport', id, report, undefined, username);
    return report;
  }
}
