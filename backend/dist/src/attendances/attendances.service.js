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
exports.AttendancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendancesService = class AttendancesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrUpdate(createAttendanceDto) {
        const { personnelId, projectId, date, status } = createAttendanceDto;
        const dateObj = new Date(date);
        dateObj.setUTCHours(0, 0, 0, 0);
        const existing = await this.prisma.attendance.findFirst({
            where: {
                personnelId,
                projectId,
                date: dateObj
            }
        });
        if (existing) {
            return this.prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    status,
                    timeIn: createAttendanceDto.timeIn ? new Date(createAttendanceDto.timeIn) : existing.timeIn,
                    timeOut: createAttendanceDto.timeOut ? new Date(createAttendanceDto.timeOut) : existing.timeOut,
                    latitude: createAttendanceDto.latitude || existing.latitude,
                    longitude: createAttendanceDto.longitude || existing.longitude,
                    address: createAttendanceDto.address || existing.address,
                    photoUrl: createAttendanceDto.photoUrl || existing.photoUrl
                }
            });
        }
        return this.prisma.attendance.create({
            data: {
                personnelId,
                projectId,
                date: dateObj,
                status,
                timeIn: createAttendanceDto.timeIn ? new Date(createAttendanceDto.timeIn) : undefined,
                timeOut: createAttendanceDto.timeOut ? new Date(createAttendanceDto.timeOut) : undefined,
                latitude: createAttendanceDto.latitude,
                longitude: createAttendanceDto.longitude,
                address: createAttendanceDto.address,
                photoUrl: createAttendanceDto.photoUrl
            }
        });
    }
    findByProjectAndDate(projectId, dateString) {
        const dateObj = new Date(dateString);
        dateObj.setUTCHours(0, 0, 0, 0);
        return this.prisma.attendance.findMany({
            where: {
                projectId,
                date: dateObj
            },
            include: {
                personnel: true
            }
        });
    }
    findAll() {
        return this.prisma.attendance.findMany({
            include: { personnel: true, project: true }
        });
    }
    remove(id) {
        return this.prisma.attendance.delete({
            where: { id },
        });
    }
    async getPayroll(projectId, month) {
        const startDate = new Date(`${month}-01T00:00:00Z`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
        const attendances = await this.prisma.attendance.findMany({
            where: {
                projectId,
                date: { gte: startDate, lte: endDate }
            },
            include: { personnel: true }
        });
        const personnelDays = {};
        for (const att of attendances) {
            if (!personnelDays[att.personnelId]) {
                personnelDays[att.personnelId] = { p: att.personnel, days: 0 };
            }
            if (att.status === 'PRESENT')
                personnelDays[att.personnelId].days += 1;
            else if (att.status === 'HALF_DAY')
                personnelDays[att.personnelId].days += 0.5;
        }
        const results = [];
        for (const pId of Object.keys(personnelDays)) {
            const { p, days } = personnelDays[Number(pId)];
            let payslip = await this.prisma.payslip.findUnique({
                where: {
                    personnelId_projectId_month: {
                        personnelId: Number(pId),
                        projectId,
                        month
                    }
                }
            });
            let advanceTotal = 0;
            if (!payslip) {
                const advances = await this.prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        personnelId: Number(pId),
                        projectId,
                        category: 'Lương nhân công',
                        date: { gte: startDate, lte: endDate }
                    }
                });
                advanceTotal = advances._sum.amount || 0;
            }
            const baseSalary = days * p.salaryPerDay;
            if (!payslip) {
                payslip = await this.prisma.payslip.create({
                    data: {
                        personnelId: Number(pId),
                        projectId,
                        month,
                        standardDays: days,
                        baseSalary,
                        allowance: 0,
                        overtimePay: 0,
                        bonus: 0,
                        deduction: 0,
                        insurance: 0,
                        advance: advanceTotal,
                        netPay: baseSalary - advanceTotal,
                        status: 'DRAFT'
                    }
                });
            }
            else if (payslip.status === 'DRAFT') {
                const netPay = baseSalary + payslip.allowance + payslip.overtimePay + payslip.bonus - payslip.deduction - payslip.insurance - payslip.advance;
                payslip = await this.prisma.payslip.update({
                    where: { id: payslip.id },
                    data: {
                        standardDays: days,
                        baseSalary,
                        netPay
                    }
                });
            }
            results.push({ ...payslip, personnel: p });
        }
        return results;
    }
    async savePayslip(id, data) {
        const payslip = await this.prisma.payslip.findUnique({ where: { id } });
        if (!payslip || payslip.status !== 'DRAFT')
            throw new Error('Cannot update accounted payslip');
        const netPay = payslip.baseSalary + (data.allowance || 0) + (data.overtimePay || 0) + (data.bonus || 0) - (data.deduction || 0) - (data.insurance || 0) - (data.advance || 0);
        return this.prisma.payslip.update({
            where: { id },
            data: {
                allowance: data.allowance,
                overtimePay: data.overtimePay,
                bonus: data.bonus,
                deduction: data.deduction,
                insurance: data.insurance,
                advance: data.advance,
                netPay
            }
        });
    }
    async accountPayroll(projectId, month) {
        const payslips = await this.prisma.payslip.findMany({
            where: { projectId, month, status: 'DRAFT' }
        });
        if (payslips.length === 0)
            return { message: 'No draft payslips to account' };
        let totalGross = 0;
        let totalInsurance = 0;
        for (const p of payslips) {
            totalGross += (p.baseSalary + p.allowance + p.overtimePay + p.bonus - p.deduction);
            totalInsurance += p.insurance;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payslip.updateMany({
                where: { projectId, month, status: 'DRAFT' },
                data: { status: 'ACCOUNTED' }
            });
            const lines = [
                { accountCode: '622', debit: totalGross, credit: 0 },
                { accountCode: '334', debit: 0, credit: totalGross }
            ];
            if (totalInsurance > 0) {
                lines.push({ accountCode: '334', debit: totalInsurance, credit: 0 });
                lines.push({ accountCode: '3383', debit: 0, credit: totalInsurance });
            }
            await tx.journalEntry.create({
                data: {
                    date: new Date(),
                    description: `Hạch toán chi phí tiền lương tháng ${month} (Dự án ${projectId})`,
                    projectId,
                    lines: {
                        create: lines
                    }
                }
            });
        });
        return { message: 'Bảng lương đã được hạch toán thành công' };
    }
    async payPayroll(projectId, month, accountId) {
        const payslips = await this.prisma.payslip.findMany({
            where: { projectId, month, status: 'ACCOUNTED' }
        });
        if (payslips.length === 0)
            return { message: 'No accounted payslips to pay' };
        let totalNetPay = 0;
        for (const p of payslips) {
            totalNetPay += p.netPay;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payslip.updateMany({
                where: { projectId, month, status: 'ACCOUNTED' },
                data: { status: 'PAID' }
            });
            const transaction = await tx.transaction.create({
                data: {
                    projectId,
                    type: 'EXPENSE',
                    amount: totalNetPay,
                    category: 'Lương nhân công',
                    date: new Date(),
                    description: `Thanh toán lương tháng ${month} (Dự án ${projectId})`,
                    accountId
                }
            });
            const creditAccount = accountId === 1 ? '1111' : '1121';
            await tx.journalEntry.create({
                data: {
                    date: new Date(),
                    description: `Thanh toán lương tháng ${month}`,
                    transactionId: transaction.id,
                    projectId,
                    lines: {
                        create: [
                            { accountCode: '334', debit: totalNetPay, credit: 0 },
                            { accountCode: creditAccount, debit: 0, credit: totalNetPay }
                        ]
                    }
                }
            });
        });
        return { message: 'Thanh toán lương thành công' };
    }
    async getPayrollSummary(month) {
        const startDate = new Date(`${month}-01T00:00:00Z`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
        const attendances = await this.prisma.attendance.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            distinct: ['projectId'],
            select: { projectId: true }
        });
        for (const att of attendances) {
            await this.getPayroll(att.projectId, month);
        }
        const payslips = await this.prisma.payslip.findMany({
            where: { month },
            include: { personnel: true, project: true }
        });
        const summary = {};
        for (const p of payslips) {
            if (!summary[p.personnelId]) {
                summary[p.personnelId] = {
                    personnel: p.personnel,
                    standardDays: 0,
                    baseSalary: 0,
                    allowance: 0,
                    overtimePay: 0,
                    bonus: 0,
                    deduction: 0,
                    insurance: 0,
                    advance: 0,
                    netPay: 0,
                    projects: []
                };
            }
            const s = summary[p.personnelId];
            s.standardDays += p.standardDays;
            s.baseSalary += p.baseSalary;
            s.allowance += p.allowance;
            s.overtimePay += p.overtimePay;
            s.bonus += p.bonus;
            s.deduction += p.deduction;
            s.insurance += p.insurance;
            s.advance += p.advance;
            s.netPay += p.netPay;
            if (!s.projects.includes(p.project.name)) {
                s.projects.push(p.project.name);
            }
        }
        return Object.values(summary);
    }
};
exports.AttendancesService = AttendancesService;
exports.AttendancesService = AttendancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendancesService);
//# sourceMappingURL=attendances.service.js.map