import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EnterpriseService {
  private settingsPath = path.join(process.cwd(), 'settings.json');

  constructor(private readonly prisma: PrismaService) {}

  // --- SETTINGS ---
  getValuationMethod(): 'AVERAGE' | 'FIFO' {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
        return data.valuationMethod || 'AVERAGE';
      }
    } catch(e) {}
    return 'AVERAGE';
  }

  setValuationMethod(method: 'AVERAGE' | 'FIFO') {
    let current: any = {};
    try {
      if (fs.existsSync(this.settingsPath)) current = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
    } catch(e) {}
    current['valuationMethod'] = method;
    fs.writeFileSync(this.settingsPath, JSON.stringify(current));
    return { success: true, method };
  }

  // --- VENDORS ---
  getVendors() {
    return this.prisma.vendor.findMany();
  }

  createVendor(data: any) {
    return this.prisma.vendor.create({ data });
  }

  updateVendor(id: number, data: any) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  // --- DEBTS ---
  getDebts() {
    return this.prisma.debt.findMany({ include: { vendor: true, customer: true } });
  }

  createDebt(data: any) {
    return this.prisma.debt.create({ data });
  }

  payDebt(id: number, amount: number, accountId: number = 1, bankFee: number = 0) {
    return this.prisma.$transaction(async (tx) => {
      const debt = await tx.debt.findUnique({ where: { id } });
      if (!debt) throw new Error('Debt not found');
      
      const newAmount = Math.max(0, debt.amount - amount);
      const status = newAmount === 0 ? 'PAID' : 'PARTIAL';
      
      // Update debt
      const updatedDebt = await tx.debt.update({
        where: { id },
        data: { amount: newAmount, status }
      });

      // Automatically create a Transaction (Phiếu Chi/Thu)
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
          projectId: 1, // default project for now
        }
      });

      return updatedDebt;
    });
  }

  // --- SALES (Bán hàng / Nghiệm thu) ---
  recordSales(data: { customerId: number, amount: number, note?: string }) {
    return this.prisma.debt.create({
      data: {
        customerId: data.customerId,
        amount: data.amount,
        type: 'RECEIVABLE',
      }
    });
  }

  // --- MOVEMENTS (Phiếu Kho) ---
  getMovements() {
    return this.prisma.inventoryMovement.findMany({ include: { project: true, material: true } });
  }

  async createMovement(data: any) {
    return this.prisma.$transaction(async (tx) => {
      let finalPrice = data.price ? Number(data.price) : 0;

      // 1. Valuation Engine for EXPORT
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
            } else if (m.type === 'EXPORT') {
              const avg = totalQty > 0 ? (totalValue / totalQty) : 0;
              totalQty -= m.quantity;
              totalValue -= (m.quantity * avg);
            }
          }
          finalPrice = totalQty > 0 ? (totalValue / totalQty) : 0;
        } else if (method === 'FIFO') {
          const batches = [];
          for (const m of history) {
            if (m.type === 'IMPORT') {
              batches.push({ qty: m.quantity, price: m.price });
            } else if (m.type === 'EXPORT') {
              let qtyToExport = m.quantity;
              while (qtyToExport > 0 && batches.length > 0) {
                if (batches[0].qty <= qtyToExport) {
                  qtyToExport -= batches[0].qty;
                  batches.shift();
                } else {
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

      // 2. Create movement
      const { vendorId, vatRate, hasInvoice, invoiceNumber, ...movementData } = data;
      const parsedVatRate = vatRate ? Number(vatRate) : 0;
      const parsedHasInvoice = hasInvoice !== undefined ? Boolean(hasInvoice) : true;
      const totalValue = data.quantity * finalPrice;
      const parsedVatAmount = parsedHasInvoice ? (totalValue * (parsedVatRate / 100)) : 0;

      movementData.price = finalPrice;
      movementData.vatRate = parsedVatRate;
      movementData.vatAmount = parsedVatAmount;
      (movementData as any).hasInvoice = parsedHasInvoice;
      if (invoiceNumber) (movementData as any).invoiceNumber = invoiceNumber;
      const movement = await tx.inventoryMovement.create({ data: movementData });
      
      const totalAmountWithVat = totalValue + parsedVatAmount;
      
      // 2. Update Inventory Quantity
      const inv = await tx.inventory.findFirst({
        where: { projectId: data.projectId, materialId: data.materialId }
      });
      
      const qtyChange = data.type === 'IMPORT' ? data.quantity : -data.quantity;

      if (inv) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: { quantity: Math.max(0, inv.quantity + qtyChange) }
        });
      } else {
        if (qtyChange > 0) {
          await tx.inventory.create({
            data: { projectId: data.projectId, materialId: data.materialId, quantity: qtyChange }
          });
        }
      }

      // 3. If IMPORT with a vendor, create a PAYABLE Debt automatically
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

      // 4. Auto-Posting to Journal
      if (totalValue > 0) {
        if (data.type === 'IMPORT') {
          const lines: any[] = [{ accountCode: '152', debit: totalValue }];
          if (parsedVatAmount > 0 && parsedHasInvoice) lines.push({ accountCode: '1331', debit: parsedVatAmount });
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
        } else if (data.type === 'EXPORT') {
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

  // --- ACCOUNTING ---
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
    const tb: Record<string, any> = {};
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
    return Object.values(tb).sort((a: any, b: any) => a.code.localeCompare(b.code));
  }
}
