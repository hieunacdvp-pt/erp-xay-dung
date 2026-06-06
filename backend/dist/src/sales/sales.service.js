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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getInvoices(projectId) {
        return this.prisma.salesInvoice.findMany({
            where: projectId ? { projectId } : undefined,
            include: { customer: true, project: true },
            orderBy: { date: 'desc' }
        });
    }
    async createInvoice(data) {
        const { projectId, customerId, description, amount, vatRate, date, costTransferPercentage, retentionPercentage } = data;
        const vatAmount = (amount * (vatRate || 0)) / 100;
        const totalAmount = amount + vatAmount;
        const transferPct = Number(costTransferPercentage || 100);
        const retentionPct = Number(retentionPercentage || 0);
        const retentionAmt = (Number(amount) * retentionPct) / 100;
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.salesInvoice.create({
                data: {
                    projectId: Number(projectId),
                    customerId: Number(customerId),
                    date: date ? new Date(date) : new Date(),
                    description,
                    amount: Number(amount),
                    vatRate: Number(vatRate || 0),
                    vatAmount,
                    totalAmount,
                    costTransferPercentage: transferPct,
                    retentionPercentage: retentionPct,
                    retentionAmount: retentionAmt,
                    status: 'UNPAID'
                }
            });
            const revenueLines = [
                { accountCode: '131', debit: totalAmount, credit: 0 },
                { accountCode: '511', debit: 0, credit: amount }
            ];
            if (vatAmount > 0) {
                revenueLines.push({ accountCode: '3331', debit: 0, credit: vatAmount });
            }
            await tx.journalEntry.create({
                data: {
                    date: invoice.date,
                    projectId: Number(projectId),
                    description: `Ghi nhận doanh thu nghiệm thu dự án (HĐ số ${invoice.id})`,
                    salesInvoiceId: invoice.id,
                    lines: {
                        create: revenueLines
                    }
                }
            });
            if (retentionAmt > 0) {
                await tx.journalEntry.create({
                    data: {
                        date: invoice.date,
                        projectId: Number(projectId),
                        description: `Trích trước chi phí bảo hành công trình (${retentionPct}%) - HĐ số ${invoice.id}`,
                        salesInvoiceId: invoice.id,
                        lines: {
                            create: [
                                { accountCode: '627', debit: retentionAmt, credit: 0 },
                                { accountCode: '352', debit: 0, credit: retentionAmt }
                            ]
                        }
                    }
                });
            }
            const incomes = await tx.transaction.findMany({ where: { projectId: Number(projectId), type: 'INCOME' } });
            const materialExports = await tx.inventoryMovement.findMany({ where: { projectId: Number(projectId), type: 'EXPORT' } });
            const machineAllocations = await tx.assetAllocation.findMany({ where: { projectId: Number(projectId) } });
            const expenses = await tx.transaction.findMany({ where: { projectId: Number(projectId), type: 'EXPENSE' } });
            const materialCost = materialExports.reduce((sum, m) => sum + (m.quantity * m.price), 0);
            const machineCost = machineAllocations.reduce((sum, a) => sum + a.amount, 0);
            const laborAndOtherCost = expenses.reduce((sum, t) => sum + t.amount, 0);
            const accountedPayslips = await tx.payslip.findMany({ where: { projectId: Number(projectId), status: { in: ['ACCOUNTED', 'PAID'] } } });
            const totalLaborCost = accountedPayslips.reduce((sum, p) => sum + (p.baseSalary + p.allowance + p.overtimePay + p.bonus - p.deduction), 0);
            const otherExpenses = expenses.filter(e => !e.description?.includes('lương')).reduce((sum, e) => sum + e.amount, 0);
            const totalIncurredCost = materialCost + machineCost + totalLaborCost + otherExpenses;
            const pastCOGS = await tx.journalEntryLine.aggregate({
                where: {
                    accountCode: '632',
                    journalEntry: { salesInvoice: { projectId: Number(projectId) } }
                },
                _sum: { debit: true }
            });
            const transferredCost = pastCOGS._sum.debit || 0;
            const remainingCost = Math.max(0, totalIncurredCost - transferredCost);
            const transferAmount = Math.round((transferPct / 100) * remainingCost);
            if (transferAmount > 0) {
                await tx.journalEntry.create({
                    data: {
                        date: invoice.date,
                        description: `Kết chuyển giá vốn (${transferPct}%) cho nghiệm thu (HĐ số ${invoice.id})`,
                        salesInvoiceId: invoice.id,
                        lines: {
                            create: [
                                { accountCode: '632', debit: transferAmount, credit: 0 },
                                { accountCode: '154', debit: 0, credit: transferAmount }
                            ]
                        }
                    }
                });
            }
            return invoice;
        });
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map