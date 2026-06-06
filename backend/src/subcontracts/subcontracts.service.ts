import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubcontractsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.subcontract.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null
      }
    });
  }

  findAll() {
    return this.prisma.subcontract.findMany({
      include: {
        subcontractor: true,
        project: true,
        acceptances: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.subcontract.findUnique({
      where: { id },
      include: {
        subcontractor: true,
        project: true,
        acceptances: true
      }
    });
  }

  update(id: number, data: any) {
    return this.prisma.subcontract.update({
      where: { id },
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) })
      }
    });
  }

  async createAcceptance(subcontractId: number, data: any) {
    const acceptance = await this.prisma.subcontractAcceptance.create({
      data: {
        subcontractId,
        date: new Date(data.date),
        acceptedValue: data.acceptedValue,
        note: data.note
      }
    });

    // Tự động hạch toán Nợ 154 / Có 331 (Chứng từ nghiệp vụ khác, không qua quỹ)
    const subcontract = await this.prisma.subcontract.findUnique({
      where: { id: subcontractId }
    });

    if (subcontract) {
      await this.prisma.journalEntry.create({
        data: {
          description: `Nghiệm thu HĐ thầu phụ: ${subcontract.name}`,
          date: new Date(data.date),
          projectId: subcontract.projectId,
          lines: {
            create: [
              { accountCode: '154', debit: data.acceptedValue, credit: 0 },
              { accountCode: '331', credit: data.acceptedValue, debit: 0 }
            ]
          }
        }
      });
    }

    return acceptance;
  }
}
