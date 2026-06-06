"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAssets() {
        return this.prisma.asset.findMany({ include: { allocations: true } });
    }
    createAsset(data) {
        return this.prisma.asset.create({ data });
    }
    getAllocations() {
        return this.prisma.assetAllocation.findMany({ include: { asset: true, project: true } });
    }
    createAllocation(data) {
        return this.prisma.assetAllocation.create({ data });
    }
    async runMonthlyDepreciation(assetId, projectId, month) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            throw new Error('Asset not found');
        const existing = await this.prisma.assetAllocation.findFirst({
            where: { assetId: Number(assetId), month }
        });
        if (existing)
            throw new Error('Asset already depreciated for this month');
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
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map