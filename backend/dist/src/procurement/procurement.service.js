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
exports.ProcurementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProcurementService = class ProcurementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPR(data) {
        for (const item of data.items) {
            const budget = await this.prisma.projectBudget.findFirst({
                where: { projectId: data.projectId, materialId: item.materialId }
            });
            if (budget) {
                const pastItems = await this.prisma.purchaseRequestItem.findMany({
                    where: {
                        materialId: item.materialId,
                        purchaseRequest: {
                            projectId: data.projectId,
                            status: { not: 'REJECTED' }
                        }
                    }
                });
                const requestedQuantity = pastItems.reduce((sum, i) => sum + i.quantity, 0);
                if (requestedQuantity + item.quantity > budget.quantity) {
                    throw new Error(`Vượt hạn mức dự toán! Vật tư ID ${item.materialId} chỉ còn được phép mua tối đa ${Math.max(0, budget.quantity - requestedQuantity)} ${budget.unit || ''}. Vui lòng xin nới lỏng ngân sách.`);
                }
            }
            else {
            }
        }
        const pr = await this.prisma.purchaseRequest.create({
            data: {
                projectId: data.projectId,
                date: new Date(data.date),
                notes: data.notes,
                status: 'PENDING',
                items: {
                    create: data.items.map((item) => ({
                        materialId: item.materialId,
                        quantity: item.quantity
                    }))
                }
            },
            include: { items: true }
        });
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
            await this.prisma.internalMessage.create({
                data: {
                    senderId: admin.id,
                    receiverRole: 'ALL',
                    title: 'Có Yêu cầu mua sắm mới',
                    content: `Dự án vừa gửi Yêu cầu mua sắm PR-${pr.id.toString().padStart(4, '0')}. Vui lòng kiểm tra và duyệt.`,
                    type: 'SYSTEM_ALERT'
                }
            });
        }
        return pr;
    }
    async findAllPRs() {
        return this.prisma.purchaseRequest.findMany({
            include: {
                project: true,
                items: { include: { material: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async approvePR(id, level) {
        const pr = await this.prisma.purchaseRequest.findUnique({ where: { id } });
        if (!pr)
            throw new common_1.NotFoundException('PR not found');
        let newStatus = pr.status;
        if (level === 'PROCUREMENT') {
            newStatus = 'PROCUREMENT_APPROVED';
        }
        else if (level === 'BUDGET') {
            newStatus = 'BUDGET_APPROVED';
        }
        else if (level === 'REJECT') {
            newStatus = 'REJECTED';
        }
        const updatedPr = await this.prisma.purchaseRequest.update({
            where: { id },
            data: { status: newStatus }
        });
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
            let title = '';
            let content = '';
            if (level === 'PROCUREMENT') {
                title = 'Phòng Vật tư đã duyệt YCMS';
                content = `Yêu cầu mua sắm PR-${id.toString().padStart(4, '0')} đã được Phòng Vật tư duyệt. Chờ Kế toán duyệt ngân sách.`;
            }
            else if (level === 'BUDGET') {
                title = 'Yêu cầu mua sắm đã được duyệt (Ngân sách)';
                content = `Yêu cầu mua sắm PR-${id.toString().padStart(4, '0')} đã được Kế toán duyệt 100%. Vui lòng tiến hành lập Đơn đặt hàng.`;
            }
            else if (level === 'REJECT') {
                title = 'Yêu cầu mua sắm bị từ chối';
                content = `Yêu cầu mua sắm PR-${id.toString().padStart(4, '0')} đã bị từ chối.`;
            }
            await this.prisma.internalMessage.create({
                data: {
                    senderId: admin.id,
                    receiverRole: 'ALL',
                    title,
                    content,
                    type: 'SYSTEM_ALERT'
                }
            });
        }
        return updatedPr;
    }
    async updatePR(id, data) {
        const pr = await this.prisma.purchaseRequest.findUnique({ where: { id } });
        if (!pr)
            throw new common_1.NotFoundException('PR not found');
        if (pr.status !== 'PENDING' && pr.status !== 'REJECTED') {
            throw new Error('Chỉ được sửa Yêu cầu khi đang Chờ duyệt hoặc Bị từ chối');
        }
        return this.prisma.purchaseRequest.update({
            where: { id },
            data: {
                projectId: data.projectId,
                notes: data.notes
            }
        });
    }
    async deletePR(id) {
        const pr = await this.prisma.purchaseRequest.findUnique({ where: { id } });
        if (!pr)
            throw new common_1.NotFoundException('PR not found');
        if (pr.status !== 'PENDING' && pr.status !== 'REJECTED') {
            throw new Error('Chỉ được xóa Yêu cầu khi đang Chờ duyệt hoặc Bị từ chối');
        }
        return this.prisma.purchaseRequest.delete({ where: { id } });
    }
    async createPO(data) {
        for (const item of data.items) {
            const budget = await this.prisma.projectBudget.findFirst({
                where: { projectId: data.projectId, materialId: item.materialId }
            });
            if (budget) {
                const pastItems = await this.prisma.purchaseOrderItem.findMany({
                    where: {
                        materialId: item.materialId,
                        purchaseOrder: {
                            projectId: data.projectId,
                            status: { not: 'REJECTED' }
                        }
                    }
                });
                const orderedQuantity = pastItems.reduce((sum, i) => sum + i.quantity, 0);
                if (orderedQuantity + item.quantity > budget.quantity) {
                    throw new Error(`Vượt hạn mức dự toán! Vật tư ID ${item.materialId} chỉ còn được phép đặt thêm tối đa ${Math.max(0, budget.quantity - orderedQuantity)} ${budget.unit || ''}.`);
                }
            }
        }
        const code = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        const po = await this.prisma.purchaseOrder.create({
            data: {
                code,
                vendorId: data.vendorId,
                projectId: data.projectId,
                date: new Date(data.date),
                status: 'PENDING',
                totalAmount: data.totalAmount,
                vatAmount: data.vatAmount || 0,
                isDirectToSite: data.isDirectToSite || false,
                notes: data.notes,
                invoiceNumber: data.invoiceNumber,
                items: {
                    create: data.items.map((item) => ({
                        materialId: item.materialId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice
                    }))
                }
            },
            include: { items: true }
        });
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
            await this.prisma.internalMessage.create({
                data: {
                    senderId: admin.id,
                    receiverRole: 'ALL',
                    title: 'Có Đơn đặt hàng (PO) mới',
                    content: `Vừa có Đơn đặt hàng mới ${code} gửi cho Nhà cung cấp. Cần Kế toán trưởng duyệt.`,
                    type: 'SYSTEM_ALERT'
                }
            });
        }
        return po;
    }
    async findAllPOs() {
        return this.prisma.purchaseOrder.findMany({
            include: {
                vendor: true,
                project: true,
                items: { include: { material: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async approvePO(id, level) {
        const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
        if (!po)
            throw new common_1.NotFoundException('PO not found');
        let newStatus = po.status;
        if (level === 'ACCOUNTANT') {
            newStatus = 'ACCOUNTANT_APPROVED';
        }
        else if (level === 'DIRECTOR') {
            newStatus = 'DIRECTOR_APPROVED';
        }
        else if (level === 'REJECT') {
            newStatus = 'REJECTED';
        }
        const updatedPo = await this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: newStatus }
        });
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
            let title = '';
            let content = '';
            if (level === 'ACCOUNTANT') {
                title = 'Kế toán trưởng đã duyệt PO';
                content = `Đơn đặt hàng ${po.code} đã được Kế toán trưởng duyệt. Chờ Giám đốc duyệt.`;
            }
            else if (level === 'DIRECTOR') {
                title = 'Giám đốc đã duyệt PO';
                content = `Đơn đặt hàng ${po.code} đã được Giám đốc duyệt. Vui lòng gửi cho Nhà cung cấp và chuẩn bị nhận hàng.`;
            }
            else if (level === 'REJECT') {
                title = 'Đơn đặt hàng bị từ chối';
                content = `Đơn đặt hàng ${po.code} đã bị từ chối.`;
            }
            await this.prisma.internalMessage.create({
                data: {
                    senderId: admin.id,
                    receiverRole: 'ALL',
                    title,
                    content,
                    type: 'SYSTEM_ALERT'
                }
            });
        }
        return updatedPo;
    }
    async updatePO(id, data) {
        const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
        if (!po)
            throw new common_1.NotFoundException('PO not found');
        if (po.status !== 'PENDING' && po.status !== 'REJECTED') {
            throw new Error('Chỉ được sửa Đơn hàng khi đang Chờ duyệt hoặc Bị từ chối');
        }
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                notes: data.notes
            }
        });
    }
    async deletePO(id) {
        const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
        if (!po)
            throw new common_1.NotFoundException('PO not found');
        if (po.status !== 'PENDING' && po.status !== 'REJECTED') {
            throw new Error('Chỉ được xóa Đơn hàng khi đang Chờ duyệt hoặc Bị từ chối');
        }
        return this.prisma.purchaseOrder.delete({ where: { id } });
    }
    async receivePO(id, invoiceNumber) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: { items: { include: { material: true } }, vendor: true }
        });
        if (!po)
            throw new common_1.NotFoundException('Không tìm thấy Đơn đặt hàng');
        if (po.status === 'RECEIVED')
            throw new Error('Đơn hàng đã được nhận');
        await this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: 'RECEIVED' }
        });
        if (!po.isDirectToSite) {
            for (const item of po.items) {
                await this.prisma.inventoryMovement.create({
                    data: {
                        type: 'IMPORT',
                        projectId: po.projectId,
                        materialId: item.materialId,
                        quantity: item.quantity,
                        price: item.unitPrice,
                        note: `Nhập từ PO: ${po.code}`,
                        invoiceNumber: invoiceNumber || null
                    }
                });
                const inventory = await this.prisma.inventory.findUnique({
                    where: { projectId_materialId: { projectId: po.projectId, materialId: item.materialId } }
                });
                if (inventory) {
                    await this.prisma.inventory.update({
                        where: { id: inventory.id },
                        data: { quantity: inventory.quantity + item.quantity }
                    });
                }
                else {
                    await this.prisma.inventory.create({
                        data: {
                            projectId: po.projectId,
                            materialId: item.materialId,
                            quantity: item.quantity
                        }
                    });
                }
            }
        }
        const debitAccount = po.isDirectToSite ? '154' : '152';
        await this.prisma.journalEntry.create({
            data: {
                description: `Nhận hàng từ PO: ${po.code} (${po.vendor?.name})`,
                date: new Date(),
                projectId: po.projectId,
                lines: {
                    create: [
                        { accountCode: debitAccount, debit: po.totalAmount, credit: 0 },
                        { accountCode: '331', credit: po.totalAmount, debit: 0 }
                    ]
                }
            }
        });
        return { message: 'Đã nhận hàng và hạch toán thành công' };
    }
};
exports.ProcurementService = ProcurementService;
exports.ProcurementService = ProcurementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcurementService);
//# sourceMappingURL=procurement.service.js.map