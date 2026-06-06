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
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EquipmentService = class EquipmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.equipment.findMany({
            orderBy: { id: 'desc' }
        });
    }
    async create(data) {
        return this.prisma.equipment.create({ data });
    }
    async update(id, data) {
        return this.prisma.equipment.update({ where: { id }, data });
    }
    async delete(id) {
        return this.prisma.equipment.delete({ where: { id } });
    }
    async findAllDispatches() {
        return this.prisma.equipmentDispatch.findMany({
            include: {
                equipment: true,
                project: true
            },
            orderBy: { startDate: 'desc' }
        });
    }
    async createDispatch(data) {
        return this.prisma.equipmentDispatch.create({ data });
    }
    async updateDispatch(id, data) {
        return this.prisma.equipmentDispatch.update({ where: { id }, data });
    }
    async deleteDispatch(id) {
        return this.prisma.equipmentDispatch.delete({ where: { id } });
    }
    async findAllUsages() {
        return this.prisma.equipmentUsage.findMany({
            include: {
                equipment: true,
                project: true
            },
            orderBy: { date: 'desc' }
        });
    }
    async createUsage(data) {
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
    async updateUsage(id, data) {
        const usage = await this.prisma.equipmentUsage.findUnique({ where: { id } });
        if (!usage)
            throw new Error('Usage not found');
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
    async approveUsage(id, approvedBy) {
        const usage = await this.prisma.equipmentUsage.findUnique({
            where: { id },
            include: { equipment: true, project: true }
        });
        if (!usage)
            throw new common_1.NotFoundException('Usage not found');
        if (usage.status === 'APPROVED')
            return usage;
        return this.prisma.$transaction(async (tx) => {
            const updatedUsage = await tx.equipmentUsage.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    approvedBy
                }
            });
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
    async deleteUsage(id) {
        const usage = await this.prisma.equipmentUsage.findUnique({ where: { id } });
        if (usage?.status === 'APPROVED') {
            throw new Error('Cannot delete an approved usage log. Please reverse it first.');
        }
        return this.prisma.equipmentUsage.delete({ where: { id } });
    }
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map