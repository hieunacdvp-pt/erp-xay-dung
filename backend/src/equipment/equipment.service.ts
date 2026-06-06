import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.equipment.findMany({
      orderBy: { id: 'desc' }
    });
  }

  async create(data: any) {
    return this.prisma.equipment.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.equipment.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.equipment.delete({ where: { id } });
  }

  // --- Dispatches ---
  async findAllDispatches() {
    return this.prisma.equipmentDispatch.findMany({
      include: {
        equipment: true,
        project: true
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async createDispatch(data: any) {
    return this.prisma.equipmentDispatch.create({ data });
  }

  async updateDispatch(id: number, data: any) {
    return this.prisma.equipmentDispatch.update({ where: { id }, data });
  }

  async deleteDispatch(id: number) {
    return this.prisma.equipmentDispatch.delete({ where: { id } });
  }

  // --- Usages ---
  async findAllUsages() {
    return this.prisma.equipmentUsage.findMany({
      include: {
        equipment: true,
        project: true
      },
      orderBy: { date: 'desc' }
    });
  }

  async createUsage(data: any) {
    // data must include: equipmentId, projectId, date, shifts, costPerShift, notes
    const totalCost = data.shifts * data.costPerShift;
    return this.prisma.equipmentUsage.create({
      data: {
        equipmentId: data.equipmentId,
        projectId: data.projectId,
        date: new Date(data.date),
        shifts: data.shifts,
        costPerShift: data.costPerShift,
        totalCost: totalCost,
        notes: data.notes,
        status: 'PENDING'
      }
    });
  }

  async updateUsage(id: number, data: any) {
    const usage = await this.prisma.equipmentUsage.findUnique({ where: { id } });
    if (!usage) throw new Error('Usage not found');
    if (usage.status === 'APPROVED') {
      throw new Error('Cannot edit an approved usage log.');
    }
    const shifts = data.shifts ?? usage.shifts;
    const costPerShift = data.costPerShift ?? usage.costPerShift;
    const totalCost = shifts * costPerShift;
    
    return this.prisma.equipmentUsage.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : usage.date,
        totalCost
      }
    });
  }

  async approveUsage(id: number, approvedBy: string) {
    const usage = await this.prisma.equipmentUsage.findUnique({
      where: { id },
      include: { equipment: true, project: true }
    });

    if (!usage) throw new NotFoundException('Usage not found');
    if (usage.status === 'APPROVED') return usage; // Already approved

    // Update status & Generate Journal Entry in a transaction
    return this.prisma.$transaction(async (tx) => {
      const updatedUsage = await tx.equipmentUsage.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy
        }
      });

      // Sinh bút toán Nợ 154 / Có 214 (Khấu hao máy) hoặc 331 (Nếu thuê ngoài)
      // Tạm thời giả định: Có 214 cho máy tự có, Có 331 cho máy đi thuê
      const creditAccount = usage.equipment.ownership === 'RENTED' ? '331' : '214';

      await tx.journalEntry.create({
        data: {
          description: `Chi phí ca máy ${usage.equipment.name} tại dự án ${usage.project.name} (${usage.shifts} ca)`,
          equipmentUsageId: usage.id,
          date: new Date(),
          projectId: usage.projectId,
          lines: {
            create: [
              { accountCode: '154', debit: usage.totalCost, credit: 0 },
              { accountCode: creditAccount, debit: 0, credit: usage.totalCost }
            ]
          }
        }
      });

      return updatedUsage;
    });
  }

  async deleteUsage(id: number) {
    // Only delete if PENDING
    const usage = await this.prisma.equipmentUsage.findUnique({ where: { id } });
    if (usage?.status === 'APPROVED') {
      throw new Error('Cannot delete an approved usage log. Please reverse it first.');
    }
    return this.prisma.equipmentUsage.delete({ where: { id } });
  }
}
