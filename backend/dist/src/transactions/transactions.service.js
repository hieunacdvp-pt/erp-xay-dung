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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTransactionDto) {
        let accountId = createTransactionDto.accountId;
        if (!accountId) {
            let firstAccount = await this.prisma.bankAccount.findFirst();
            if (!firstAccount) {
                firstAccount = await this.prisma.bankAccount.create({
                    data: { name: 'Tiền mặt', type: 'CASH' }
                });
            }
            accountId = firstAccount.id;
        }
        const vatRate = createTransactionDto.vatRate ? Number(createTransactionDto.vatRate) : 0;
        const amount = Number(createTransactionDto.amount);
        const vatAmount = amount * (vatRate / 100);
        const totalAmount = amount + vatAmount;
        if (createTransactionDto.type === 'EXPENSE' && createTransactionDto.projectId) {
            const lowerCat = createTransactionDto.category.toLowerCase();
            let budgetCat = null;
            if (lowerCat.includes('nhân công'))
                budgetCat = 'NHAN_CONG';
            else if (lowerCat.includes('máy'))
                budgetCat = 'MAY_THI_CONG';
            else if (!lowerCat.includes('vật tư') && !lowerCat.includes('công nợ'))
                budgetCat = 'CHUNG';
            if (budgetCat) {
                const budgets = await this.prisma.projectBudget.findMany({
                    where: { projectId: Number(createTransactionDto.projectId), category: budgetCat }
                });
                const totalBudget = budgets.reduce((sum, b) => sum + b.totalValue, 0);
                if (totalBudget > 0) {
                    const pastExpenses = await this.prisma.transaction.findMany({
                        where: {
                            projectId: Number(createTransactionDto.projectId),
                            type: 'EXPENSE',
                            category: { contains: budgetCat === 'NHAN_CONG' ? 'nhân công' : (budgetCat === 'MAY_THI_CONG' ? 'máy' : '') }
                        }
                    });
                    let pastAmount = 0;
                    if (budgetCat === 'CHUNG') {
                        const chungExpenses = await this.prisma.transaction.findMany({
                            where: {
                                projectId: Number(createTransactionDto.projectId),
                                type: 'EXPENSE',
                                category: { notIn: ['Thanh toán công nợ', 'Vật tư', 'Nhân công'] }
                            }
                        });
                        pastAmount = chungExpenses.reduce((sum, t) => sum + t.amount, 0);
                    }
                    else {
                        pastAmount = pastExpenses.reduce((sum, t) => sum + t.amount, 0);
                    }
                    if (pastAmount + amount > totalBudget) {
                        throw new Error(`Vượt hạn mức dự toán! Ngân sách chi phí ${budgetCat} chỉ còn lại ${Math.max(0, totalBudget - pastAmount).toLocaleString()} VNĐ.`);
                    }
                }
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    type: createTransactionDto.type,
                    amount: Number(createTransactionDto.amount),
                    bankFee: Number(createTransactionDto.bankFee || 0),
                    category: createTransactionDto.category,
                    description: createTransactionDto.description,
                    accountId,
                    projectId: createTransactionDto.projectId ? Number(createTransactionDto.projectId) : null,
                    personnelId: createTransactionDto.personnelId ? Number(createTransactionDto.personnelId) : null,
                    isDirectMaterial: Boolean(createTransactionDto.isDirectMaterial),
                    vatRate,
                    vatAmount,
                    invoiceNumber: createTransactionDto.invoiceNumber,
                },
            });
            const accType = await tx.bankAccount.findUnique({ where: { id: accountId } });
            const cashAccount = accType?.type === 'BANK' ? '112' : '111';
            if (transaction.type === 'INCOME') {
                const lines = [{ accountCode: cashAccount, debit: totalAmount }];
                if (transaction.category === 'Thanh toán công nợ') {
                    lines.push({ accountCode: '131', credit: totalAmount });
                }
                else {
                    lines.push({ accountCode: '511', credit: amount });
                    if (vatAmount > 0)
                        lines.push({ accountCode: '3331', credit: vatAmount });
                }
                await tx.journalEntry.create({
                    data: {
                        description: `Thu tiền: ${transaction.description || transaction.category}`,
                        transactionId: transaction.id,
                        projectId: transaction.projectId,
                        lines: { create: lines }
                    }
                });
            }
            else if (transaction.type === 'EXPENSE') {
                const lines = [{ accountCode: cashAccount, credit: totalAmount }];
                if (transaction.category === 'Thanh toán công nợ') {
                    lines.push({ accountCode: '331', debit: totalAmount });
                }
                else if (transaction.category.toLowerCase().includes('nhân công')) {
                    lines.push({ accountCode: '334', debit: amount });
                }
                else if (transaction.category.toLowerCase().includes('vật tư')) {
                    if (transaction.isDirectMaterial && transaction.projectId) {
                        lines.push({ accountCode: '154', debit: amount });
                    }
                    else {
                        lines.push({ accountCode: '152', debit: amount });
                    }
                    if (vatAmount > 0)
                        lines.push({ accountCode: '1331', debit: vatAmount });
                }
                else if (!transaction.projectId) {
                    lines.push({ accountCode: '642', debit: amount });
                    if (vatAmount > 0)
                        lines.push({ accountCode: '1331', debit: vatAmount });
                }
                else {
                    lines.push({ accountCode: '627', debit: amount });
                    if (vatAmount > 0)
                        lines.push({ accountCode: '1331', debit: vatAmount });
                }
                await tx.journalEntry.create({
                    data: {
                        description: `Chi tiền: ${transaction.description || transaction.category}`,
                        transactionId: transaction.id,
                        projectId: transaction.projectId,
                        lines: { create: lines }
                    }
                });
            }
            return transaction;
        });
    }
    findAll() {
        return this.prisma.transaction.findMany({
            include: {
                project: true,
                account: true,
            }
        });
    }
    findOne(id) {
        return this.prisma.transaction.findUnique({
            where: { id },
            include: {
                project: true,
                account: true,
            }
        });
    }
    update(id, updateTransactionDto) {
        return this.prisma.transaction.update({
            where: { id },
            data: updateTransactionDto,
        });
    }
    remove(id) {
        return this.prisma.transaction.delete({
            where: { id },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map