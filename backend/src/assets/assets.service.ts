import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  getAssets() {
    return this.prisma.asset.findMany({ include: { allocations: true } });
  }

  createAsset(data: any) {
    return this.prisma.asset.create({ data });
  }

  getAllocations() {
    return this.prisma.assetAllocation.findMany({ include: { asset: true, project: true } });
  }

  createAllocation(data: any) {
    return this.prisma.assetAllocation.create({ data });
  }

  async runMonthlyDepreciation(assetId: number, projectId: number, month: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');

    // Check if already depreciated for this month and this asset
    const existing = await this.prisma.assetAllocation.findFirst({
      where: { assetId: Number(assetId), month }
    });
    if (existing) throw new Error('Asset already depreciated for this month');

    const depreciationAmount = asset.purchasePrice / asset.depreciationMonths;

    return this.prisma.$transaction(async (tx) => {
      const allocation = await tx.assetAllocation.create({
        data: {
          assetId: Number(assetId),
          projectId: Number(projectId),
          month,
          amount: depreciationAmount
        }
      });

      // Tạo Bút toán trích khấu hao (Nợ 627 / Có 214)
      await tx.journalEntry.create({
        data: {
          date: new Date(),
          description: `Trích khấu hao máy thi công ${asset.name} tháng ${month} cho dự án ${projectId}`,
          assetAllocationId: allocation.id,
          lines: {
            create: [
              { accountCode: '627', debit: depreciationAmount, credit: 0 },
              { accountCode: '214', debit: 0, credit: depreciationAmount }
            ]
          }
        }
      });

      return allocation;
    });
  }
}
