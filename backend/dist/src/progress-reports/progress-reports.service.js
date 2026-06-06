"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const auditlogs_service_1 = require("../auditlogs/auditlogs.service");
let ProgressReportsService = class ProgressReportsService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async create(createProgressReportDto) {
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
    async findOne(id) {
        return this.prisma.progressReport.findUnique({
            where: { id },
            include: {
                project: true,
                reporter: true
            }
        });
    }
    async remove(id, username) {
        const report = await this.prisma.progressReport.delete({
            where: { id }
        });
        await this.auditLogs.log('DELETE', 'ProgressReport', id, report, undefined, username);
        return report;
    }
};
exports.ProgressReportsService = ProgressReportsService;
exports.ProgressReportsService = ProgressReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auditlogs_service_1.AuditlogsService])
], ProgressReportsService);
//# sourceMappingURL=progress-reports.service.js.map