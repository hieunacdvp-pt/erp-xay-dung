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
exports.SystemSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SystemSettingsService = class SystemSettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        const records = await this.prisma.systemSetting.findMany();
        const settings = {};
        records.forEach(r => settings[r.key] = r.value);
        return settings;
    }
    async updateSetting(key, value) {
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
};
exports.SystemSettingsService = SystemSettingsService;
exports.SystemSettingsService = SystemSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemSettingsService);
//# sourceMappingURL=system-settings.service.js.map