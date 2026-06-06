import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';

@Injectable()
export class RequisitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditlogsService
  ) {}

  async create(createRequisitionDto: any) {
    // KÊM TRA VƯỢT DỰ TOÁN
    let isOverBudget = false;
    for (const item of createRequisitionDto.items) {
      const budget = await this.prisma.projectBudget.findFirst({
        where: { projectId: createRequisitionDto.projectId, materialId: item.materialId }
      });
      const budgetedQty = budget ? budget.quantity : 0;

      const pastItems = await this.prisma.materialRequisitionItem.findMany({
        where: {
          materialId: item.materialId,
          requisition: {
            projectId: createRequisitionDto.projectId,
            status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] }
          }
        }
      });
      const pastRequestedQty = pastItems.reduce((sum, i) => sum + i.quantity, 0);

      if (pastRequestedQty + item.quantity > budgetedQty) {
        isOverBudget = true;
        break;
      }
    }

    const req = await this.prisma.materialRequisition.create({
      data: {
        projectId: createRequisitionDto.projectId,
        requesterId: createRequisitionDto.requesterId,
        note: createRequisitionDto.note,
        isOverBudget: isOverBudget,
        date: createRequisitionDto.date ? new Date(createRequisitionDto.date) : new Date(),
        items: {
          create: createRequisitionDto.items.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });
    await this.auditLogs.log('CREATE', 'MaterialRequisition', req.id, req, undefined, createRequisitionDto.username);
    
    // Gửi thông báo cho ADMIN và GIAMDOC
    const title = isOverBudget ? 'CẢNH BÁO: Yêu cầu vật tư vượt dự toán' : 'Yêu cầu vật tư mới';
    const content = isOverBudget 
      ? `Phiếu yêu cầu vật tư #${req.id} có chứa vật tư VƯỢT ĐỊNH MỨC DỰ TOÁN. Vui lòng kiểm tra kỹ trước khi duyệt.`
      : `Có yêu cầu cấp vật tư mới từ công trường (Mã: #${req.id}). Vui lòng phê duyệt.`;

    await this.prisma.internalMessage.createMany({
      data: [
        {
          senderId: 1, // System or current user ID if available
          receiverRole: 'ADMIN',
          title: title,
          content: content,
          type: 'SYSTEM_ALERT'
        },
        {
          senderId: 1,
          receiverRole: 'GIAMDOC',
          title: title,
          content: content,
          type: 'SYSTEM_ALERT'
        },
        {
          senderId: 1,
          receiverRole: 'KETOAN',
          title: title,
          content: content,
          type: 'SYSTEM_ALERT'
        }
      ]
    });

    return req;
  }

  async findAll() {
    return this.prisma.materialRequisition.findMany({
      include: {
        project: true,
        requester: true,
        items: {
          include: { material: true }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.materialRequisition.findUnique({
      where: { id },
      include: {
        project: true,
        requester: true,
        items: {
          include: { material: true }
        }
      }
    });
  }

  async approve(id: number, username: string) {
    const req = await this.prisma.materialRequisition.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    await this.auditLogs.log('UPDATE', 'MaterialRequisition', id, { status: 'APPROVED' }, undefined, username);
    
    // Báo cho KHO xuất hàng
    await this.prisma.internalMessage.create({
      data: {
        senderId: 1, // System
        receiverRole: 'KHO',
        title: 'Yêu cầu vật tư đã duyệt',
        content: `Yêu cầu cấp vật tư #${req.id} đã được phê duyệt. Vui lòng tiến hành xuất kho.`,
        type: 'SYSTEM_ALERT'
      }
    });

    return req;
  }

  async reject(id: number, username: string) {
    const req = await this.prisma.materialRequisition.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
    await this.auditLogs.log('UPDATE', 'MaterialRequisition', id, { status: 'REJECTED' }, undefined, username);
    return req;
  }

  async fulfill(id: number, username: string) {
    const req = await this.prisma.materialRequisition.findUnique({
      where: { id },
      include: { items: { include: { material: true } } }
    });
    
    if (!req) throw new BadRequestException('Requisition not found');
    if (req.status !== 'APPROVED') throw new BadRequestException('Requisition must be APPROVED to fulfill');

    for (const item of req.items) {
      const inv = await this.prisma.inventory.findUnique({
        where: { projectId_materialId: { projectId: req.projectId, materialId: item.materialId } }
      });
      const qty = item.quantity;
      const price = item.material?.price || 0;
      const totalValue = qty * price;
      
      const mov = await this.prisma.inventoryMovement.create({
        data: {
          type: 'EXPORT',
          projectId: req.projectId,
          materialId: item.materialId,
          quantity: qty,
          price: price,
          note: `Xuất kho tự động theo Yêu cầu cấp vật tư #${req.id}`
        }
      });
      
      if (totalValue > 0) {
        await this.prisma.journalEntry.create({
          data: {
            date: new Date(),
            description: `Xuất kho NVL công trình (Phiếu YC #${req.id})`,
            movementId: mov.id,
            projectId: req.projectId,
            lines: {
              create: [
                { accountCode: '154', debit: totalValue, credit: 0 },
                { accountCode: '152', debit: 0, credit: totalValue }
              ]
            }
          }
        });
      }
      
      if (inv) {
        await this.prisma.inventory.update({
          where: { id: inv.id },
          data: { quantity: inv.quantity - qty }
        });
      } else {
        await this.prisma.inventory.create({
          data: {
            projectId: req.projectId,
            materialId: item.materialId,
            quantity: -qty
          }
        });
      }
    }

    const updated = await this.prisma.materialRequisition.update({
      where: { id },
      data: { status: 'FULFILLED' }
    });
    
    await this.auditLogs.log('UPDATE', 'MaterialRequisition', id, { status: 'FULFILLED' }, undefined, username);
    return updated;
  }
}
