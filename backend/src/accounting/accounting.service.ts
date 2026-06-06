import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrialBalance(startDate?: string, endDate?: string) {
    // 1. Get all accounts
    const accounts = await this.prisma.account.findMany({
      orderBy: { code: 'asc' }
    });

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { journalEntry: { date: dateFilter } } : {};

    // 2. Aggregate JournalEntryLines
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

    // 3. Map to accounts
    return accounts.map(acc => {
      const { debit, credit } = lineMap.get(acc.code) || { debit: 0, credit: 0 };
      let finalBalance = 0;
      const startChar = acc.code.charAt(0);
      if (['1', '2', '6', '8'].includes(startChar)) {
        finalBalance = debit - credit;
      } else {
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

  async getGeneralLedger(accountCode: string, startDate?: string, endDate?: string, projectId?: number) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where: any = {
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

  async getPnl(projectId?: number, startDate?: string, endDate?: string) {
    let projects = [];
    if (projectId) {
      const p = await this.prisma.project.findUnique({ 
        where: { id: projectId },
        include: { contract: { include: { customer: true } } }
      });
      if (p) projects.push(p);
    } else {
      projects = await this.prisma.project.findMany({
        orderBy: { id: 'desc' },
        include: { contract: { include: { customer: true } } }
      });
    }

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
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
          } else {
            const isCostAccount = ['154', '621', '622', '623', '627', '642', '334'].some(prefix => line.accountCode.startsWith(prefix));
            if (isCostAccount && line.debit > 0) {
              const desc = entry.description.toLowerCase();
              const cat = entry.transaction?.category?.toLowerCase() || '';

              if (line.accountCode.startsWith('621') || desc.includes('nvl') || desc.includes('po') || desc.includes('vật tư') || cat.includes('vật tư')) {
                costMaterial += line.debit;
              } else if (line.accountCode.startsWith('623') || desc.includes('ca máy') || desc.includes('máy') || cat.includes('máy') || cat.includes('thiết bị') || cat.includes('vận chuyển')) {
                costEquipment += line.debit;
              } else if (desc.includes('thầu phụ') || cat.includes('thầu phụ')) {
                costSubcontractor += line.debit;
              } else if (line.accountCode.startsWith('622') || line.accountCode.startsWith('334') || desc.includes('nhân công') || cat.includes('nhân công') || cat.includes('lương')) {
                costLabor += line.debit;
              } else {
                costGeneral += line.debit;
              }
            }
          }
        }
      }

      const totalCost = costMaterial + costLabor + costEquipment + costGeneral + costSubcontractor;
      const grossProfit = revenue - totalCost;

      // Only push if there's any financial activity
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
}
