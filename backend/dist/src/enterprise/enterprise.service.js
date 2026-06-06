"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let EnterpriseService = class EnterpriseService {
    prisma;
    settingsPath = path.join(process.cwd(), 'settings.json');
    constructor(prisma) {
        this.prisma = prisma;
    }
    getValuationMethod() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
                return data.valuationMethod || 'AVERAGE';
            }
        }
        catch (e) { }
        return 'AVERAGE';
    }
    setValuationMethod(method) {
        let current = {};
        try {
            if (fs.existsSync(this.settingsPath))
                current = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
        }
        catch (e) { }
        current['valuationMethod'] = method;
        fs.writeFileSync(this.settingsPath, JSON.stringify(current));
        return { success: true, method };
    }
    getVendors() {
        return this.prisma.vendor.findMany();
    }
    createVendor(data) {
        return this.prisma.vendor.create({ data });
    }
    updateVendor(id, data) {
        return this.prisma.vendor.update({ where: { id }, data });
    }
    getDebts() {
        return this.prisma.debt.findMany({ include: { vendor: true, customer: true } });
    }
    createDebt(data) {
        return this.prisma.debt.create({ data });
    }
    payDebt(id, amount, accountId = 1, bankFee = 0) {
        return this.prisma.$transaction(async (tx) => {
            const debt = await tx.debt.findUnique({ where: { id } });
            if (!debt)
                throw new Error('Debt not found');
            const newAmount = Math.max(0, debt.amount - amount);
            const status = newAmount === 0 ? 'PAID' : 'PARTIAL';
            const updatedDebt = await tx.debt.update({
                where: { id },
                data: { amount: newAmount, status }
            });
            await tx.transaction.create({
                data: {
                    type: debt.type === 'PAYABLE' ? 'EXPENSE' : 'INCOME',
                    amount,
                    bankFee,
                    accountId,
                    category: 'Thanh toán công nợ',
                    date: new Date(),
                    description: debt.type === 'PAYABLE'
                        ? `Thanh toán cho nhà cung cấp #${debt.vendorId || ''}`
                        : `Thu tiền từ khách hàng #${debt.customerId || ''}`,
                    projectId: 1,
                }
            });
            return updatedDebt;
        });
    }
    recordSales(data) {
        return this.prisma.debt.create({
            data: {
                customerId: data.customerId,
                amount: data.amount,
                type: 'RECEIVABLE',
            }
        });
    }
    getMovements() {
        return this.prisma.inventoryMovement.findMany({ include: { project: true, material: true } });
    }
    async createMovement(data) {
        return this.prisma.$transaction(async (tx) => {
            let finalPrice = data.price ? Number(data.price) : 0;
            if (data.type === 'EXPORT') {
                const method = this.getValuationMethod();
                const history = await tx.inventoryMovement.findMany({
                    where: { projectId: data.projectId, materialId: data.materialId },
                    orderBy: { id: 'asc' }
                });
                if (method === 'AVERAGE') {
                    let totalQty = 0;
                    let totalValue = 0;
                    for (const m of history) {
                        if (m.type === 'IMPORT') {
                            totalQty += m.quantity;
                            totalValue += (m.quantity * m.price);
                        }
                        else if (m.type === 'EXPORT') {
                            const avg = totalQty > 0 ? (totalValue / totalQty) : 0;
                            totalQty -= m.quantity;
                            totalValue -= (m.quantity * avg);
                        }
                    }
                    finalPrice = totalQty > 0 ? (totalValue / totalQty) : 0;
                }
                else if (method === 'FIFO') {
                    const batches = [];
                    for (const m of history) {
                        if (m.type === 'IMPORT') {
                            batches.push({ qty: m.quantity, price: m.price });
                        }
                        else if (m.type === 'EXPORT') {
                            let qtyToExport = m.quantity;
                            while (qtyToExport > 0 && batches.length > 0) {
                                if (batches[0].qty <= qtyToExport) {
                                    qtyToExport -= batches[0].qty;
                                    batches.shift();
                                }
                                else {
                                    batches[0].qty -= qtyToExport;
                                    qtyToExport = 0;
                                }
                            }
                        }
                    }
                    let qtyToCalculate = data.quantity;
                    let totalCost = 0;
                    for (let i = 0; i < batches.length && qtyToCalculate > 0; i++) {
                        const batch = batches[i];
                        const taken = Math.min(batch.qty, qtyToCalculate);
                        totalCost += taken * batch.price;
                        qtyToCalculate -= taken;
                    }
                    finalPrice = data.quantity > 0 ? (totalCost / data.quantity) : 0;
                }
            }
            const { vendorId, vatRate, hasInvoice, invoiceNumber, ...movementData } = data;
            const parsedVatRate = vatRate ? Number(vatRate) : 0;
            const parsedHasInvoice = hasInvoice !== undefined ? Boolean(hasInvoice) : true;
            const totalValue = data.quantity * finalPrice;
            const parsedVatAmount = parsedHasInvoice ? (totalValue * (parsedVatRate / 100)) : 0;
            movementData.price = finalPrice;
            movementData.vatRate = parsedVatRate;
            movementData.vatAmount = parsedVatAmount;
            movementData.hasInvoice = parsedHasInvoice;
            if (invoiceNumber)
                movementData.invoiceNumber = invoiceNumber;
            const movement = await tx.inventoryMovement.create({ data: movementData });
            const totalAmountWithVat = totalValue + parsedVatAmount;
            const inv = await tx.inventory.findFirst({
                where: { projectId: data.projectId, materialId: data.materialId }
            });
            const qtyChange = data.type === 'IMPORT' ? data.quantity : -data.quantity;
            if (inv) {
                await tx.inventory.update({
                    where: { id: inv.id },
                    data: { quantity: Math.max(0, inv.quantity + qtyChange) }
                });
            }
            else {
                if (qtyChange > 0) {
                    await tx.inventory.create({
                        data: { projectId: data.projectId, materialId: data.materialId, quantity: qtyChange }
                    });
                }
            }
            if (data.type === 'IMPORT' && data.vendorId) {
                if (totalAmountWithVat > 0) {
                    await tx.debt.create({
                        data: {
                            vendorId: data.vendorId,
                            amount: totalAmountWithVat,
                            type: 'PAYABLE'
                        }
                    });
                }
            }
            if (totalValue > 0) {
                if (data.type === 'IMPORT') {
                    const lines = [{ accountCode: '152', debit: totalValue }];
                    if (parsedVatAmount > 0 && parsedHasInvoice)
                        lines.push({ accountCode: '1331', debit: parsedVatAmount });
                    lines.push({ accountCode: '331', credit: totalAmountWithVat });
                    await tx.journalEntry.create({
                        data: {
                            description: parsedHasInvoice
                                ? `Nhập kho vật tư #${movement.materialId} (HĐ: ${invoiceNumber || 'Chưa có'})`
                                : `Nhập kho tạm tính chưa có hóa đơn #${movement.materialId}`,
                            movementId: movement.id,
                            lines: { create: lines }
                        }
                    });
                }
                else if (data.type === 'EXPORT') {
                    await tx.journalEntry.create({
                        data: {
                            description: `Xuất kho vật tư #${movement.materialId} cho công trình #${movement.projectId}`,
                            movementId: movement.id,
                            lines: {
                                create: [
                                    { accountCode: '154', debit: totalValue },
                                    { accountCode: '152', credit: totalValue }
                                ]
                            }
                        }
                    });
                }
            }
            return movement;
        });
    }
    getAccounts() {
        return this.prisma.account.findMany({ orderBy: { code: 'asc' } });
    }
    getJournalEntries() {
        return this.prisma.journalEntry.findMany({
            include: { lines: { include: { account: true } } },
            orderBy: { date: 'desc' }
        });
    }
    async getTrialBalance() {
        const lines = await this.prisma.journalEntryLine.findMany({
            include: { account: true }
        });
        const tb = {};
        for (const line of lines) {
            if (!tb[line.accountCode]) {
                tb[line.accountCode] = {
                    code: line.accountCode,
                    name: line.account.name,
                    type: line.account.type,
                    debit: 0,
                    credit: 0
                };
            }
            tb[line.accountCode].debit += line.debit;
            tb[line.accountCode].credit += line.credit;
        }
        return Object.values(tb).sort((a, b) => a.code.localeCompare(b.code));
    }
};
exports.EnterpriseService = EnterpriseService;
exports.EnterpriseService = EnterpriseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnterpriseService);
//# sourceMappingURL=enterprise.service.js.map