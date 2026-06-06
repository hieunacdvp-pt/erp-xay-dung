import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
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

    // Prepare VAT
    const vatRate = createTransactionDto.vatRate ? Number(createTransactionDto.vatRate) : 0;
    const amount = Number(createTransactionDto.amount);
    const vatAmount = amount * (vatRate / 100);
    const totalAmount = amount + vatAmount;

    // Check Budget limits for EXPENSE
    if (createTransactionDto.type === 'EXPENSE' && createTransactionDto.projectId) {
      const lowerCat = createTransactionDto.category.toLowerCase();
      let budgetCat = null;
      if (lowerCat.includes('nhân công')) budgetCat = 'NHAN_CONG';
      else if (lowerCat.includes('máy')) budgetCat = 'MAY_THI_CONG';
      else if (!lowerCat.includes('vật tư') && !lowerCat.includes('công nợ')) budgetCat = 'CHUNG';

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
          
          // Lọc lại chính xác cho CHUNG
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
          } else {
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
        const lines: any[] = [{ accountCode: cashAccount, debit: totalAmount }];
        if (transaction.category === 'Thanh toán công nợ') {
          lines.push({ accountCode: '131', credit: totalAmount });
        } else {
          lines.push({ accountCode: '511', credit: amount });
          if (vatAmount > 0) lines.push({ accountCode: '3331', credit: vatAmount });
        }
        await tx.journalEntry.create({
          data: {
            description: `Thu tiền: ${transaction.description || transaction.category}`,
            transactionId: transaction.id,
            projectId: transaction.projectId,
            lines: { create: lines }
          }
        });
      } else if (transaction.type === 'EXPENSE') {
        const lines: any[] = [{ accountCode: cashAccount, credit: totalAmount }];
        if (transaction.category === 'Thanh toán công nợ') {
          lines.push({ accountCode: '331', debit: totalAmount });
        } else if (transaction.category.toLowerCase().includes('nhân công')) {
          lines.push({ accountCode: '334', debit: amount });
          // Note: Payment of salary directly. A real ERP might do 622 -> 334 then 334 -> 111
        } else if (transaction.category.toLowerCase().includes('vật tư')) {
          if (transaction.isDirectMaterial && transaction.projectId) {
            lines.push({ accountCode: '154', debit: amount }); // Xuất thẳng công trình
          } else {
            lines.push({ accountCode: '152', debit: amount }); // Nhập kho
          }
          if (vatAmount > 0) lines.push({ accountCode: '1331', debit: vatAmount });
        } else if (!transaction.projectId) {
          // Giao dịch chung không có dự án
          lines.push({ accountCode: '642', debit: amount });
          if (vatAmount > 0) lines.push({ accountCode: '1331', debit: vatAmount });
        } else {
          // Các chi phí khác của dự án
          lines.push({ accountCode: '627', debit: amount }); // Hoặc 642 tùy kế toán
          if (vatAmount > 0) lines.push({ accountCode: '1331', debit: vatAmount });
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

  findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        project: true,
        account: true,
      }
    });
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  remove(id: number) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
