import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const records = await this.prisma.systemSetting.findMany();
    const settings: Record<string, string> = {};
    records.forEach(r => settings[r.key] = r.value);
    return settings;
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async resetTrialData() {
    await this.prisma.$transaction([
      this.prisma.journalEntryLine.deleteMany(),
      this.prisma.journalEntry.deleteMany(),
      this.prisma.transaction.deleteMany(),
      this.prisma.paymentStage.deleteMany(),
      this.prisma.subcontractAcceptance.deleteMany(),
      this.prisma.subcontract.deleteMany(),
      this.prisma.purchaseOrderItem.deleteMany(),
      this.prisma.purchaseOrder.deleteMany(),
      this.prisma.purchaseRequestItem.deleteMany(),
      this.prisma.purchaseRequest.deleteMany(),
      this.prisma.materialRequisitionItem.deleteMany(),
      this.prisma.materialRequisition.deleteMany(),
      this.prisma.equipmentUsage.deleteMany(),
      this.prisma.equipmentDispatch.deleteMany(),
      this.prisma.inventoryMovement.deleteMany(),
      this.prisma.progressReport.deleteMany(),
      this.prisma.guaranteeLetter.deleteMany(),
      this.prisma.salesInvoice.deleteMany(),
      this.prisma.contract.deleteMany(),
      this.prisma.projectBudget.deleteMany(),
      this.prisma.project.deleteMany(),
      this.prisma.internalMessage.deleteMany(),
      this.prisma.auditLog.deleteMany(),
    ]);

    return { success: true, message: 'Đã xóa dữ liệu dùng thử thành công' };
  }
}
