import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private auditLogger: AuditlogsService
  ) {}

  async create(createContractDto: any) {
    const { milestones, ...contractData } = createContractDto;
    
    const contract = await this.prisma.contract.create({
      data: {
        ...contractData,
        milestones: milestones ? {
          create: milestones
        } : undefined
      },
      include: {
        milestones: true,
        project: true,
        customer: true,
        guaranteeLetters: true
      }
    });
    
    await this.auditLogger.log('CREATE', 'Contract', contract.id, contract);
    return contract;
  }

  findAll() {
    return this.prisma.contract.findMany({
      include: {
        project: true,
        customer: true,
        milestones: true,
        guaranteeLetters: true
      }
    });
  }

  async findOne(id: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        project: true,
        customer: true,
        milestones: true,
        guaranteeLetters: true
      }
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async update(id: number, updateContractDto: any) {
    const { milestones, ...contractData } = updateContractDto;

    // Handle nested milestones
    const updateOperations = [];
    
    if (milestones) {
      // Very basic approach: delete all existing and re-create. 
      // In production, you might want to upsert to keep IDs.
      await this.prisma.contractMilestone.deleteMany({
        where: { contractId: id }
      });
      
      const updated = await this.prisma.contract.update({
        where: { id },
        data: {
          ...contractData,
          milestones: {
            create: milestones
          }
        },
        include: {
          project: true,
          customer: true,
          milestones: true,
          guaranteeLetters: true
        }
      });
      await this.auditLogger.log('UPDATE', 'Contract', id, updated);
      return updated;
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: contractData,
      include: {
        project: true,
        customer: true,
        milestones: true,
        guaranteeLetters: true
      }
    });
    await this.auditLogger.log('UPDATE', 'Contract', id, updated);
    return updated;
  }

  async remove(id: number) {
    await this.prisma.$transaction([
      this.prisma.contractMilestone.deleteMany({ where: { contractId: id } }),
      this.prisma.guaranteeLetter.deleteMany({ where: { contractId: id } }),
      this.prisma.contract.delete({ where: { id } })
    ]);
    await this.auditLogger.log('DELETE', 'Contract', id, { deleted: true });
    return { success: true };
  }

  // --- MILESTONE STATUS & ACCOUNTING ---
  async updateMilestoneStatus(milestoneId: number, body: any) {
    const { status, accountId } = body;
    const milestone = await this.prisma.contractMilestone.findUnique({ where: { id: milestoneId }, include: { contract: true } });
    if (!milestone) throw new NotFoundException('Milestone not found');

    const updated = await this.prisma.contractMilestone.update({
      where: { id: milestoneId },
      data: { status }
    });

    if (status === 'INVOICED') {
      await this.prisma.journalEntry.create({
        data: {
          description: `Nghiệm thu hợp đồng: ${milestone.name}`,
          projectId: milestone.contract.projectId,
          lines: {
            create: [
              { accountCode: '131', debit: milestone.amount, credit: 0 },
              { accountCode: '511', debit: 0, credit: milestone.amount }
            ]
          }
        }
      });
    } else if (status === 'PAID') {
      const trn = await this.prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: milestone.amount,
          category: 'OTHER',
          description: `Thu tiền CĐT: ${milestone.name}`,
          accountId: accountId || 1,
          date: new Date()
        }
      });
      await this.prisma.journalEntry.create({
        data: {
          description: `Thu tiền CĐT: ${milestone.name}`,
          transactionId: trn.id,
          projectId: milestone.contract.projectId,
          lines: {
            create: [
              { accountCode: '112', debit: milestone.amount, credit: 0 },
              { accountCode: '131', debit: 0, credit: milestone.amount }
            ]
          }
        }
      });
    }
    return updated;
  }

  // --- GUARANTEE LETTERS ---
  async addGuaranteeLetter(contractId: number, data: any) {
    return this.prisma.guaranteeLetter.create({
      data: {
        contractId,
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date()
      }
    });
  }

  async updateGuaranteeLetter(id: number, data: any) {
    return this.prisma.guaranteeLetter.update({
      where: { id },
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
      }
    });
  }

  async removeGuaranteeLetter(id: number) {
    return this.prisma.guaranteeLetter.delete({ where: { id } });
  }
}
