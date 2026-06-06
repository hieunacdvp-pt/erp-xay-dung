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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProjectPnL(projectId, startDate, endDate) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new Error('Project not found');
        const budgets = await this.prisma.projectBudget.findMany({ where: { projectId } });
        const totalBudget = budgets.reduce((sum, b) => sum + b.totalValue, 0);
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter['date'] = {};
            if (startDate)
                dateFilter['date'].gte = new Date(startDate);
            if (endDate)
                dateFilter['date'].lte = new Date(endDate);
        }
        const contract = await this.prisma.contract.findUnique({
            where: { projectId },
            include: { milestones: true }
        });
        let revenue = 0;
        if (contract && contract.value > 0) {
            revenue = contract.value;
        }
        else {
            const invoices = await this.prisma.salesInvoice.findMany({
                where: { projectId, ...dateFilter }
            });
            revenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        }
        const exports = await this.prisma.inventoryMovement.findMany({
            where: { projectId, type: 'EXPORT', ...dateFilter },
            include: { material: true }
        });
        const materialCost = exports.reduce((sum, mov) => sum + (mov.quantity * mov.price), 0);
        const payslipDateFilter = {};
        if (startDate || endDate) {
            payslipDateFilter['createdAt'] = {};
            if (startDate)
                payslipDateFilter['createdAt'].gte = new Date(startDate);
            if (endDate)
                payslipDateFilter['createdAt'].lte = new Date(endDate);
        }
        const payslips = await this.prisma.payslip.findMany({
            where: { projectId, status: { not: 'DRAFT' }, ...payslipDateFilter },
            include: { personnel: true }
        });
        const laborCost = payslips.reduce((sum, p) => sum + (p.baseSalary + p.allowance + p.overtimePay + p.bonus - p.deduction), 0);
        const allocations = await this.prisma.assetAllocation.findMany({
            where: { projectId, ...dateFilter },
            include: { asset: true }
        });
        const assetCost = allocations.reduce((sum, a) => sum + a.amount, 0);
        const otherTxs = await this.prisma.transaction.findMany({
            where: { projectId, type: 'EXPENSE', category: 'OTHER', ...dateFilter }
        });
        const otherCost = otherTxs.reduce((sum, t) => sum + t.amount, 0);
        const totalCost = materialCost + laborCost + assetCost + otherCost;
        const grossProfit = revenue - totalCost;
        const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
        let totalPaid = 0;
        let payments = [];
        if (contract && contract.milestones.length > 0) {
            const paidMilestones = contract.milestones.filter(m => m.status === 'PAID');
            totalPaid = paidMilestones.reduce((sum, m) => sum + m.amount, 0);
            payments = paidMilestones.map(m => ({ date: m.createdAt, amount: m.amount, description: m.name }));
        }
        else {
            const incomeTxs = await this.prisma.transaction.findMany({
                where: { projectId, type: 'INCOME', ...dateFilter },
                orderBy: { date: 'desc' }
            });
            totalPaid = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
            payments = incomeTxs.map(t => ({ date: t.date, amount: t.amount, description: t.description }));
        }
        return {
            project: { id: project.id, name: project.name, totalBudget },
            revenue,
            totalPaid,
            payments: payments,
            costs: {
                material: materialCost,
                labor: laborCost,
                asset: assetCost,
                other: otherCost,
                total: totalCost
            },
            details: {
                materials: exports.map(m => ({ id: m.id, date: m.date, name: m.material?.name || 'Vật tư', quantity: m.quantity, price: m.price, total: m.quantity * m.price })),
                labor: payslips.map(p => ({ id: p.id, date: p.createdAt, name: p.personnel?.name || 'Nhân sự', amount: p.baseSalary + p.allowance + p.overtimePay + p.bonus - p.deduction })),
                asset: allocations.map(a => ({ id: a.id, date: a.date, name: a.asset?.name || 'Máy TC', amount: a.amount })),
                other: otherTxs.map(t => ({ id: t.id, date: t.date, description: t.description, amount: t.amount }))
            },
            grossProfit,
            profitMargin
        };
    }
    async getAllProjectsPnL(startDate, endDate) {
        const projects = await this.prisma.project.findMany();
        const result = [];
        for (const p of projects) {
            const pnl = await this.getProjectPnL(p.id, startDate, endDate);
            result.push(pnl);
        }
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter['date'] = {};
            if (startDate)
                dateFilter['date'].gte = new Date(startDate);
            if (endDate)
                dateFilter['date'].lte = new Date(endDate);
        }
        const overheadTxs = [];
        const overheadTotal = 0;
        const cashDebit = await this.prisma.journalEntryLine.aggregate({
            where: { accountCode: { in: ['111', '112'] } },
            _sum: { debit: true }
        });
        const cashCredit = await this.prisma.journalEntryLine.aggregate({
            where: { accountCode: { in: ['111', '112'] } },
            _sum: { credit: true }
        });
        const totalCash = (cashDebit._sum.debit || 0) - (cashCredit._sum.credit || 0);
        const bankAccounts = await this.prisma.bankAccount.findMany();
        const openingBalance = bankAccounts.reduce((sum, b) => sum + (b.openingBalance || 0), 0);
        const finalCash = totalCash + openingBalance;
        const taxDebit = await this.prisma.journalEntryLine.aggregate({
            where: { accountCode: '3331' },
            _sum: { debit: true }
        });
        const taxCredit = await this.prisma.journalEntryLine.aggregate({
            where: { accountCode: '3331' },
            _sum: { credit: true }
        });
        const totalTaxPayable = (taxCredit._sum.credit || 0) - (taxDebit._sum.debit || 0);
        return {
            projects: result,
            overhead: {
                total: overheadTotal,
                details: overheadTxs.map(t => ({ id: t.id, date: t.date, description: t.description, amount: t.amount, category: t.category }))
            },
            cashflowWarning: {
                totalCash: finalCash,
                totalTaxPayable: Math.max(0, totalTaxPayable)
            }
        };
    }
    async getTaxExcel(res, month, year) {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const sheetIn = workbook.addWorksheet('Bang ke Mua vao');
        sheetIn.columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Số hóa đơn', key: 'invoiceNumber', width: 20 },
            { header: 'Ngày chứng từ', key: 'date', width: 15 },
            { header: 'Tên nhà cung cấp / Diễn giải', key: 'description', width: 40 },
            { header: 'Giá trị hàng hóa (Chưa VAT)', key: 'amount', width: 20 },
            { header: 'Tiền thuế VAT', key: 'vatAmount', width: 15 },
            { header: 'Ghi chú', key: 'note', width: 20 },
        ];
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const inventoryImports = await this.prisma.inventoryMovement.findMany({
            where: {
                type: 'IMPORT',
                invoiceNumber: { not: null },
                date: { gte: startDate, lte: endDate }
            },
            include: { material: true }
        });
        const expenseTxs = await this.prisma.transaction.findMany({
            where: {
                type: 'EXPENSE',
                vatAmount: { gt: 0 },
                date: { gte: startDate, lte: endDate }
            }
        });
        let rowIndex = 1;
        let totalInAmount = 0;
        let totalInVat = 0;
        for (const item of inventoryImports) {
            const amount = item.quantity * item.price;
            const vatAmount = item.vatAmount || (amount * (item.vatRate || 0) / 100);
            sheetIn.addRow({
                stt: rowIndex++,
                invoiceNumber: item.invoiceNumber,
                date: item.date.toLocaleDateString('vi-VN'),
                description: `Nhập kho ${item.material?.name || 'vật tư'} - ${item.note || ''}`,
                amount,
                vatAmount,
                note: 'Từ Phiếu nhập kho'
            });
            totalInAmount += amount;
            totalInVat += vatAmount;
        }
        for (const tx of expenseTxs) {
            sheetIn.addRow({
                stt: rowIndex++,
                invoiceNumber: tx.invoiceNumber || 'HĐ-Trực tiếp',
                date: tx.date.toLocaleDateString('vi-VN'),
                description: tx.description || tx.category,
                amount: tx.amount,
                vatAmount: tx.vatAmount,
                note: 'Từ Phiếu chi/UNC'
            });
            totalInAmount += tx.amount;
            totalInVat += tx.vatAmount || 0;
        }
        sheetIn.addRow({
            stt: '',
            invoiceNumber: '',
            date: '',
            description: 'TỔNG CỘNG',
            amount: totalInAmount,
            vatAmount: totalInVat,
            note: ''
        });
        const sheetOut = workbook.addWorksheet('Bang ke Ban ra');
        sheetOut.columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Số hóa đơn', key: 'invoiceNumber', width: 20 },
            { header: 'Ngày chứng từ', key: 'date', width: 15 },
            { header: 'Tên người mua / Diễn giải', key: 'description', width: 40 },
            { header: 'Doanh thu (Chưa VAT)', key: 'amount', width: 20 },
            { header: 'Tiền thuế VAT', key: 'vatAmount', width: 15 },
            { header: 'Ghi chú', key: 'note', width: 20 },
        ];
        const salesInvoices = await this.prisma.salesInvoice.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            include: { customer: true }
        });
        const incomeTxs = await this.prisma.transaction.findMany({
            where: {
                type: 'INCOME',
                vatAmount: { gt: 0 },
                date: { gte: startDate, lte: endDate }
            }
        });
        rowIndex = 1;
        let totalOutAmount = 0;
        let totalOutVat = 0;
        for (const inv of salesInvoices) {
            sheetOut.addRow({
                stt: rowIndex++,
                invoiceNumber: `HD-${inv.id}`,
                date: inv.date.toLocaleDateString('vi-VN'),
                description: `Bán hàng cho ${inv.customer?.name || 'Khách lẻ'}`,
                amount: inv.amount,
                vatAmount: inv.vatAmount,
                note: 'Hóa đơn bán ra'
            });
            totalOutAmount += inv.amount;
            totalOutVat += inv.vatAmount || 0;
        }
        for (const tx of incomeTxs) {
            sheetOut.addRow({
                stt: rowIndex++,
                invoiceNumber: tx.invoiceNumber || 'HĐ-Trực tiếp',
                date: tx.date.toLocaleDateString('vi-VN'),
                description: tx.description || tx.category,
                amount: tx.amount,
                vatAmount: tx.vatAmount,
                note: 'Từ Phiếu thu/Giấy báo có'
            });
            totalOutAmount += tx.amount;
            totalOutVat += tx.vatAmount || 0;
        }
        sheetOut.addRow({
            stt: '',
            invoiceNumber: '',
            date: '',
            description: 'TỔNG CỘNG',
            amount: totalOutAmount,
            vatAmount: totalOutVat,
            note: ''
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Bang_Ke_Thue_T${month}_${year}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map