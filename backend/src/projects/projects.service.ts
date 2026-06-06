import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProjectDto: CreateProjectDto) {
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

  findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async getCosting(projectId: number) {
    // 1. Revenue (Doanh thu) - From INCOME transactions linked to project
    const incomes = await this.prisma.transaction.findMany({
      where: { projectId, type: 'INCOME' }
    });
    const revenue = incomes.reduce((sum, t) => sum + t.amount, 0);

    // 2. Material Cost (Chi phí vật tư) - From EXPORT inventory movements
    const materialExports = await this.prisma.inventoryMovement.findMany({
      where: { projectId, type: 'EXPORT' }
    });
    const materialCost = materialExports.reduce((sum, m) => sum + (m.quantity * m.price), 0);

    // 3. Machine Cost (Chi phí máy/Khấu hao) - From AssetAllocation
    const machineAllocations = await this.prisma.assetAllocation.findMany({
      where: { projectId }
    });
    const machineCost = machineAllocations.reduce((sum, a) => sum + a.amount, 0);

    // 4. Labor & Other Direct Costs (Chi phí Nhân công & Khác) - From EXPENSE transactions categorized as Labor
    const expenses = await this.prisma.transaction.findMany({
      where: { 
        projectId, 
        type: 'EXPENSE',
        // Assuming user will type 'Nhân công' or 'Labor' in category
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

  async getBudgets(projectId: number) {
    return this.prisma.projectBudget.findMany({
      where: { projectId },
      include: { material: true }
    });
  }

  async importBudgets(projectId: number, budgets: any[]) {
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

  async getBudgetStatus(projectId: number) {
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
}
