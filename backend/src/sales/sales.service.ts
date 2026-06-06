import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  getInvoices(projectId?: number) {
    return this.prisma.salesInvoice.findMany({
      where: projectId ? { projectId } : undefined,
      include: { customer: true, project: true },
      orderBy: { date: 'desc' }
    });
  }

  async createInvoice(data: any) {
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

      // 1. Tạo Bút toán ghi nhận Doanh thu & Công nợ (Nợ 131, Có 511, Có 3331)
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
          projectId: Number(projectId), // FIX: Thêm projectId để PnL tìm thấy
          description: `Ghi nhận doanh thu nghiệm thu dự án (HĐ số ${invoice.id})`,
          salesInvoiceId: invoice.id,
          lines: {
            create: revenueLines
          }
        }
      });

      // 1.5. Nếu có Giữ lại bảo hành -> Trích trước chi phí bảo hành (Nợ 627 / Có 352)
      if (retentionAmt > 0) {
        await tx.journalEntry.create({
          data: {
            date: invoice.date,
            projectId: Number(projectId), // FIX
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

      // 2. Tính toán Giá vốn (632) từ Chi phí dở dang (154)
      // Tổng chi phí (Material, Labor, etc.)
      const incomes = await tx.transaction.findMany({ where: { projectId: Number(projectId), type: 'INCOME' } });
      const materialExports = await tx.inventoryMovement.findMany({ where: { projectId: Number(projectId), type: 'EXPORT' } });
      const machineAllocations = await tx.assetAllocation.findMany({ where: { projectId: Number(projectId) } });
      const expenses = await tx.transaction.findMany({ where: { projectId: Number(projectId), type: 'EXPENSE' } });
      
      // Tính lại tổng chi phí đã phát sinh (giống getCosting)
      const materialCost = materialExports.reduce((sum, m) => sum + (m.quantity * m.price), 0);
      const machineCost = machineAllocations.reduce((sum, a) => sum + a.amount, 0);
      
      // Lưu ý: Lương được trả qua Transaction (Expense) hoặc chốt bảng lương. Nếu đã trả thì có Transaction, hoặc lấy từ JournalEntry. Để chuẩn xác nhất cho bản MVP, lấy từ Transaction EXPENSE
      const laborAndOtherCost = expenses.reduce((sum, t) => sum + t.amount, 0);
      
      // Thêm lương chưa chi trả (đã hạch toán qua bảng lương nhưng chưa trả bằng Transaction)
      const accountedPayslips = await tx.payslip.findMany({ where: { projectId: Number(projectId), status: { in: ['ACCOUNTED', 'PAID'] } } });
      // Tránh tính đúp: nếu PAID thì đã có Transaction EXPENSE. Nên chỉ cộng khoản ACCOUNTED chưa trả? 
      // Thôi, để đơn giản, tổng hợp chi phí 154 = materialCost + machineCost + laborCost(all payslips) + other expenses
      // Sửa lại cách tính cho chuẩn:
      const totalLaborCost = accountedPayslips.reduce((sum, p) => sum + (p.baseSalary + p.allowance + p.overtimePay + p.bonus - p.deduction), 0);
      
      const otherExpenses = expenses.filter(e => !e.description?.includes('lương')).reduce((sum, e) => sum + e.amount, 0);

      const totalIncurredCost = materialCost + machineCost + totalLaborCost + otherExpenses;

      // Tính tổng giá vốn ĐÃ kết chuyển trước đó (qua các invoice khác)
      const pastCOGS = await tx.journalEntryLine.aggregate({
        where: { 
          accountCode: '632', 
          journalEntry: { salesInvoice: { projectId: Number(projectId) } }
        },
        _sum: { debit: true }
      });
      
      const transferredCost = pastCOGS._sum.debit || 0;
      const remainingCost = Math.max(0, totalIncurredCost - transferredCost);
      
      // Tính số tiền kết chuyển đợt này
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
                { accountCode: '154', debit: 0, credit: transferAmount } // Giả lập rút từ 154
              ]
            }
          }
        });
      }

      return invoice;
    });
  }
}
