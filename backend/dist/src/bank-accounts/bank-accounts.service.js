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
exports.BankAccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BankAccountsService = class BankAccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.bankAccount.create({
            data: {
                name: data.name,
                type: data.type,
                accountNumber: data.accountNumber,
                bankName: data.bankName,
                openingBalance: Number(data.openingBalance || 0)
            },
        });
    }
    async findAll() {
        const accounts = await this.prisma.bankAccount.findMany({
            include: {
                transactions: true,
                transfersOut: true,
                transfersIn: true
            }
        });
        return accounts.map(acc => {
            const income = acc.transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
            const expense = acc.transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
            const fees = acc.transactions.reduce((sum, t) => sum + (t.bankFee || 0), 0);
            const transfersOut = acc.transfersOut.reduce((sum, t) => sum + t.amount + t.fee, 0);
            const transfersIn = acc.transfersIn.reduce((sum, t) => sum + t.amount, 0);
            return {
                ...acc,
                balance: acc.openingBalance + income - expense - fees - transfersOut + transfersIn
            };
        });
    }
    async findOne(id) {
        const acc = await this.prisma.bankAccount.findUnique({
            where: { id },
            include: {
                transactions: true,
                transfersOut: true,
                transfersIn: true
            }
        });
        if (!acc)
            return null;
        const income = acc.transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const expense = acc.transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
        const fees = acc.transactions.reduce((sum, t) => sum + (t.bankFee || 0), 0);
        const transfersOut = acc.transfersOut.reduce((sum, t) => sum + t.amount + t.fee, 0);
        const transfersIn = acc.transfersIn.reduce((sum, t) => sum + t.amount, 0);
        return {
            ...acc,
            balance: acc.openingBalance + income - expense - fees - transfersOut + transfersIn
        };
    }
    async createInternalTransfer(data) {
        const { fromAccountId, toAccountId, amount, fee, description, date } = data;
        return this.prisma.$transaction(async (tx) => {
            const transfer = await tx.internalTransfer.create({
                data: {
                    fromAccountId: Number(fromAccountId),
                    toAccountId: Number(toAccountId),
                    amount: Number(amount),
                    fee: Number(fee || 0),
                    description,
                    date: date ? new Date(date) : new Date(),
                }
            });
            const fromAccount = await tx.bankAccount.findUnique({ where: { id: Number(fromAccountId) } });
            const toAccount = await tx.bankAccount.findUnique({ where: { id: Number(toAccountId) } });
            const expenseTx = await tx.transaction.create({
                data: {
                    type: 'EXPENSE',
                    amount: Number(amount),
                    bankFee: Number(fee || 0),
                    category: 'Chuyển tiền nội bộ',
                    description,
                    accountId: Number(fromAccountId),
                    internalTransferId: transfer.id,
                    date: transfer.date,
                }
            });
            const incomeTx = await tx.transaction.create({
                data: {
                    type: 'INCOME',
                    amount: Number(amount),
                    category: 'Chuyển tiền nội bộ',
                    description,
                    accountId: Number(toAccountId),
                    internalTransferId: transfer.id,
                    date: transfer.date,
                }
            });
            const fromCode = fromAccount?.type === 'BANK' ? '112' : '111';
            const toCode = toAccount?.type === 'BANK' ? '112' : '111';
            const lines = [
                { accountCode: toCode, debit: Number(amount), credit: 0 },
                { accountCode: fromCode, debit: 0, credit: Number(amount) + Number(fee || 0) }
            ];
            if (fee > 0) {
                lines.push({ accountCode: '642', debit: Number(fee), credit: 0 });
            }
            await tx.journalEntry.create({
                data: {
                    date: transfer.date,
                    description: `Chuyển tiền nội bộ: ${description}`,
                    transactionId: expenseTx.id,
                    lines: {
                        create: lines
                    }
                }
            });
            return transfer;
        });
    }
    update(id, updateBankAccountDto) {
        return this.prisma.bankAccount.update({
            where: { id },
            data: updateBankAccountDto,
        });
    }
    remove(id) {
        return this.prisma.bankAccount.delete({
            where: { id },
        });
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BankAccountsService);
//# sourceMappingURL=bank-accounts.service.js.map