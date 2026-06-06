import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any) {
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

  async findOne(id: number) {
    const acc = await this.prisma.bankAccount.findUnique({
      where: { id },
      include: { 
        transactions: true,
        transfersOut: true,
        transfersIn: true
      }
    });
    if (!acc) return null;
    
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

  async createInternalTransfer(data: { fromAccountId: number; toAccountId: number; amount: number; fee: number; description: string; date?: string }) {
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

      // Create transaction for FROM account (EXPENSE)
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

      // Create transaction for TO account (INCOME)
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

      // Double-entry accounting
      const fromCode = fromAccount?.type === 'BANK' ? '112' : '111';
      const toCode = toAccount?.type === 'BANK' ? '112' : '111';

      const lines = [
        { accountCode: toCode, debit: Number(amount), credit: 0 },
        { accountCode: fromCode, debit: 0, credit: Number(amount) + Number(fee || 0) }
      ];

      if (fee > 0) {
        lines.push({ accountCode: '642', debit: Number(fee), credit: 0 }); // Phí ngân hàng vào 642
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

  update(id: number, updateBankAccountDto: UpdateBankAccountDto) {
    return this.prisma.bankAccount.update({
      where: { id },
      data: updateBankAccountDto,
    });
  }

  remove(id: number) {
    return this.prisma.bankAccount.delete({
      where: { id },
    });
  }
}
