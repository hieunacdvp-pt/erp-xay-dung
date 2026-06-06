import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcurementService {
  constructor(private prisma: PrismaService) {}

  // Yêu cầu mua sắm (PR)
  async createPR(data: any) {
    // Check Budget limits
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
      } else {
        // Optional: If you strictly require a budget to exist before buying, throw an error here.
        // For now, if no budget is explicitly set for this material, we allow it to avoid breaking existing demo flows.
      }
    }

    const pr = await this.prisma.purchaseRequest.create({
      data: {
        projectId: data.projectId,
        date: new Date(data.date),
        notes: data.notes,
        status: 'PENDING',
        items: {
          create: data.items.map((item: any) => ({
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
          receiverRole: 'ALL', // Or maybe 'KETOAN', 'GIAMDOC'. 'ALL' ensures everyone involved sees it
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

  async approvePR(id: number, level: string) {
    const pr = await this.prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr) throw new NotFoundException('PR not found');

    let newStatus = pr.status;
    if (level === 'PROCUREMENT') {
      newStatus = 'PROCUREMENT_APPROVED';
    } else if (level === 'BUDGET') {
      newStatus = 'BUDGET_APPROVED';
    } else if (level === 'REJECT') {
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
      } else if (level === 'BUDGET') {
        title = 'Yêu cầu mua sắm đã được duyệt (Ngân sách)';
        content = `Yêu cầu mua sắm PR-${id.toString().padStart(4, '0')} đã được Kế toán duyệt 100%. Vui lòng tiến hành lập Đơn đặt hàng.`;
      } else if (level === 'REJECT') {
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

  async updatePR(id: number, data: any) {
    const pr = await this.prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr) throw new NotFoundException('PR not found');
    if (pr.status !== 'PENDING' && pr.status !== 'REJECTED') {
      throw new Error('Chỉ được sửa Yêu cầu khi đang Chờ duyệt hoặc Bị từ chối');
    }

    // Since we don't have a complex update for items, we just update notes and project for now.
    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        projectId: data.projectId,
        notes: data.notes
      }
    });
  }

  async deletePR(id: number) {
    const pr = await this.prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr) throw new NotFoundException('PR not found');
    if (pr.status !== 'PENDING' && pr.status !== 'REJECTED') {
      throw new Error('Chỉ được xóa Yêu cầu khi đang Chờ duyệt hoặc Bị từ chối');
    }

    return this.prisma.purchaseRequest.delete({ where: { id } });
  }

  // Đơn đặt hàng (PO)
  async createPO(data: any) {
    // Check Budget limits for direct PO creation
    for (const item of data.items) {
      const budget = await this.prisma.projectBudget.findFirst({
        where: { projectId: data.projectId, materialId: item.materialId }
      });
      
      if (budget) {
        // Find total ordered in POs (not REJECTED)
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

    const code = `PO-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
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
          create: data.items.map((item: any) => ({
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

  async approvePO(id: number, level: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO not found');

    let newStatus = po.status;
    if (level === 'ACCOUNTANT') {
      newStatus = 'ACCOUNTANT_APPROVED';
    } else if (level === 'DIRECTOR') {
      newStatus = 'DIRECTOR_APPROVED';
    } else if (level === 'REJECT') {
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
      } else if (level === 'DIRECTOR') {
        title = 'Giám đốc đã duyệt PO';
        content = `Đơn đặt hàng ${po.code} đã được Giám đốc duyệt. Vui lòng gửi cho Nhà cung cấp và chuẩn bị nhận hàng.`;
      } else if (level === 'REJECT') {
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

  async updatePO(id: number, data: any) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO not found');
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

  async deletePO(id: number) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO not found');
    if (po.status !== 'PENDING' && po.status !== 'REJECTED') {
      throw new Error('Chỉ được xóa Đơn hàng khi đang Chờ duyệt hoặc Bị từ chối');
    }

    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  async receivePO(id: number, invoiceNumber?: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: { include: { material: true } }, vendor: true }
    });

    if (!po) throw new NotFoundException('Không tìm thấy Đơn đặt hàng');
    if (po.status === 'RECEIVED') throw new Error('Đơn hàng đã được nhận');

    // 1. Cập nhật trạng thái PO
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'RECEIVED' }
    });

    // 2. Tạo InventoryMovement & Cập nhật Inventory (NẾU KHÔNG PHẢI XUẤT THẲNG)
    if (!po.isDirectToSite) {
      for (const item of po.items) {
        // Tạo phiếu nhập kho
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

        // Tăng tồn kho
        const inventory = await this.prisma.inventory.findUnique({
          where: { projectId_materialId: { projectId: po.projectId, materialId: item.materialId } }
        });

        if (inventory) {
          await this.prisma.inventory.update({
            where: { id: inventory.id },
            data: { quantity: inventory.quantity + item.quantity }
          });
        } else {
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

    // 3. Hạch toán (Tạo JournalEntry)
    // Nợ 152 (nếu nhập kho) HOẶC Nợ 154 (nếu xuất thẳng)
    // Có 331 (Phải trả NCC)
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
}
