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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createProjectDto) {
        return this.prisma.project.create({
            data: {
                ...createProjectDto,
                location: createProjectDto.location || 'Unknown',
                startDate: new Date(createProjectDto.startDate),
                endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
            },
        });
    }
    findAll() {
        return this.prisma.project.findMany();
    }
    findOne(id) {
        return this.prisma.project.findUnique({
            where: { id },
        });
    }
    update(id, updateProjectDto) {
        return this.prisma.project.update({
            where: { id },
            data: updateProjectDto,
        });
    }
    remove(id) {
        return this.prisma.project.delete({
            where: { id },
        });
    }
    async getCosting(projectId) {
        const incomes = await this.prisma.transaction.findMany({
            where: { projectId, type: 'INCOME' }
        });
        const revenue = incomes.reduce((sum, t) => sum + t.amount, 0);
        const materialExports = await this.prisma.inventoryMovement.findMany({
            where: { projectId, type: 'EXPORT' }
        });
        const materialCost = materialExports.reduce((sum, m) => sum + (m.quantity * m.price), 0);
        const machineAllocations = await this.prisma.assetAllocation.findMany({
            where: { projectId }
        });
        const machineCost = machineAllocations.reduce((sum, a) => sum + a.amount, 0);
        const expenses = await this.prisma.transaction.findMany({
            where: {
                projectId,
                type: 'EXPENSE',
                category: { contains: 'Nhân công' }
            }
        });
        const laborCost = expenses.reduce((sum, t) => sum + t.amount, 0);
        const otherExpenses = await this.prisma.transaction.findMany({
            where: {
                projectId,
                type: 'EXPENSE',
                category: { notIn: ['Thanh toán công nợ', 'Nhân công'] }
            }
        });
        const otherCost = otherExpenses.reduce((sum, t) => sum + t.amount, 0) - laborCost;
        const totalCost = materialCost + machineCost + laborCost + Math.max(0, otherCost);
        const profit = revenue - totalCost;
        return {
            projectId,
            revenue,
            materialCost,
            machineCost,
            laborCost,
            otherCost: Math.max(0, otherCost),
            totalCost,
            profit
        };
    }
    async getBudgets(projectId) {
        return this.prisma.projectBudget.findMany({
            where: { projectId },
            include: { material: true }
        });
    }
    async importBudgets(projectId, budgets) {
        await this.prisma.projectBudget.deleteMany({
            where: { projectId }
        });
        const createData = [];
        for (const b of budgets) {
            const category = b.category || 'CHUNG';
            let materialId = null;
            if (category === 'NVL' && b.description) {
                let mat = await this.prisma.material.findFirst({
                    where: { name: b.description }
                });
                if (!mat) {
                    mat = await this.prisma.material.create({
                        data: {
                            name: b.description,
                            unit: b.unit || 'Cái',
                            price: parseFloat(b.unitPrice) || 0
                        }
                    });
                }
                materialId = mat.id;
            }
            createData.push({
                projectId,
                category,
                internalCode: b.internalCode || null,
                materialId,
                description: b.description || 'N/A',
                unit: b.unit || null,
                quantity: parseFloat(b.quantity) || 0,
                unitPrice: parseFloat(b.unitPrice) || 0,
                totalValue: (parseFloat(b.quantity) || 0) * (parseFloat(b.unitPrice) || 0),
                note: b.note || null,
            });
        }
        await this.prisma.projectBudget.createMany({
            data: createData
        });
        return { message: 'Đã import dự toán thành công', count: createData.length };
    }
    async getBudgetStatus(projectId) {
        const budgets = await this.prisma.projectBudget.findMany({
            where: { projectId, category: 'NVL' },
            include: { material: true }
        });
        const result = [];
        for (const b of budgets) {
            let requested = 0;
            if (b.materialId) {
                const pastItems = await this.prisma.materialRequisitionItem.findMany({
                    where: {
                        materialId: b.materialId,
                        requisition: {
                            projectId,
                            status: { in: ['PENDING', 'APPROVED', 'COMPLETED', 'FULFILLED'] }
                        }
                    }
                });
                requested = pastItems.reduce((sum, i) => sum + i.quantity, 0);
            }
            result.push({
                materialId: b.materialId,
                materialName: b.material?.name || b.description,
                unit: b.material?.unit || b.unit,
                budgeted: b.quantity,
                requested: requested,
                remaining: b.quantity - requested
            });
        }
        return result;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map