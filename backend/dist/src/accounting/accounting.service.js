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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AccountingService = class AccountingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrialBalance(startDate, endDate) {
        const accounts = await this.prisma.account.findMany({
            orderBy: { code: 'asc' }
        });
        const dateFilter = {};
        if (startDate)
            dateFilter.gte = new Date(startDate);
        if (endDate)
            dateFilter.lte = new Date(endDate);
        const dateQuery = Object.keys(dateFilter).length > 0 ? { journalEntry: { date: dateFilter } } : {};
        const lines = await this.prisma.journalEntryLine.groupBy({
            by: ['accountCode'],
            _sum: {
                debit: true,
                credit: true,
            },
            where: dateQuery
        });
        const lineMap = new Map();
        for (const l of lines) {
            lineMap.set(l.accountCode, { debit: l._sum.debit || 0, credit: l._sum.credit || 0 });
        }
        return accounts.map(acc => {
            const { debit, credit } = lineMap.get(acc.code) || { debit: 0, credit: 0 };
            let finalBalance = 0;
            const startChar = acc.code.charAt(0);
            if (['1', '2', '6', '8'].includes(startChar)) {
                finalBalance = debit - credit;
            }
            else {
                finalBalance = credit - debit;
            }
            return {
                ...acc,
                debit,
                credit,
                finalBalance
            };
        });
    }
    async getGeneralLedger(accountCode, startDate, endDate, projectId) {
        const dateFilter = {};
        if (startDate)
            dateFilter.gte = new Date(startDate);
        if (endDate)
            dateFilter.lte = new Date(endDate);
        const where = {
            accountCode,
        };
        if (Object.keys(dateFilter).length > 0) {
            where.journalEntry = { date: dateFilter };
        }
        if (projectId) {
            where.journalEntry = { ...where.journalEntry, projectId };
        }
        const lines = await this.prisma.journalEntryLine.findMany({
            where,
            include: {
                journalEntry: {
                    include: {
                        project: true,
                    }
                }
            },
            orderBy: {
                journalEntry: { date: 'asc' }
            }
        });
        return lines.map(line => ({
            id: line.id,
            date: line.journalEntry.date,
            description: line.journalEntry.description,
            project: line.journalEntry.project?.name,
            debit: line.debit,
            credit: line.credit,
        }));
    }
    async getPnl(projectId, startDate, endDate) {
        let projects = [];
        if (projectId) {
            const p = await this.prisma.project.findUnique({
                where: { id: projectId },
                include: { contract: { include: { customer: true } } }
            });
            if (p)
                projects.push(p);
        }
        else {
            projects = await this.prisma.project.findMany({
                orderBy: { id: 'desc' },
                include: { contract: { include: { customer: true } } }
            });
        }
        const dateFilter = {};
        if (startDate)
            dateFilter.gte = new Date(startDate);
        if (endDate)
            dateFilter.lte = new Date(endDate);
        const dateQuery = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
        const results = [];
        for (const p of projects) {
            const entries = await this.prisma.journalEntry.findMany({
                where: {
                    projectId: p.id,
                    ...dateQuery
                },
                include: {
                    lines: true,
                    transaction: true
                }
            });
            let revenue = 0;
            let costMaterial = 0;
            let costLabor = 0;
            let costEquipment = 0;
            let costGeneral = 0;
            let costSubcontractor = 0;
            for (const entry of entries) {
                for (const line of entry.lines) {
                    if (line.accountCode.startsWith('511')) {
                        revenue += line.credit;
                    }
                    else {
                        const isCostAccount = ['154', '621', '622', '623', '627', '642', '334'].some(prefix => line.accountCode.startsWith(prefix));
                        if (isCostAccount && line.debit > 0) {
                            const desc = entry.description.toLowerCase();
                            const cat = entry.transaction?.category?.toLowerCase() || '';
                            if (line.accountCode.startsWith('621') || desc.includes('nvl') || desc.includes('po') || desc.includes('vật tư') || cat.includes('vật tư')) {
                                costMaterial += line.debit;
                            }
                            else if (line.accountCode.startsWith('623') || desc.includes('ca máy') || desc.includes('máy') || cat.includes('máy') || cat.includes('thiết bị') || cat.includes('vận chuyển')) {
                                costEquipment += line.debit;
                            }
                            else if (desc.includes('thầu phụ') || cat.includes('thầu phụ')) {
                                costSubcontractor += line.debit;
                            }
                            else if (line.accountCode.startsWith('622') || line.accountCode.startsWith('334') || desc.includes('nhân công') || cat.includes('nhân công') || cat.includes('lương')) {
                                costLabor += line.debit;
                            }
                            else {
                                costGeneral += line.debit;
                            }
                        }
                    }
                }
            }
            const totalCost = costMaterial + costLabor + costEquipment + costGeneral + costSubcontractor;
            const grossProfit = revenue - totalCost;
            if (revenue > 0 || totalCost > 0) {
                results.push({
                    project: p,
                    revenue,
                    costMaterial,
                    costLabor,
                    costEquipment,
                    costSubcontractor,
                    costGeneral,
                    totalCost,
                    grossProfit,
                });
            }
        }
        return results;
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map