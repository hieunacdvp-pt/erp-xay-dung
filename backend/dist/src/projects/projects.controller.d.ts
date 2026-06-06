import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        location: string;
        startDate: Date;
        endDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        location: string;
        startDate: Date;
        endDate: Date | null;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        location: string;
        startDate: Date;
        endDate: Date | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getCosting(id: string): Promise<{
        projectId: number;
        revenue: number;
        materialCost: number;
        machineCost: number;
        laborCost: number;
        otherCost: number;
        totalCost: number;
        profit: number;
    }>;
    getBudgets(id: string): Promise<({
        material: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            price: number;
            unit: string;
        } | null;
    } & {
        id: number;
        description: string;
        createdAt: Date;
        projectId: number;
        category: string;
        materialId: number | null;
        quantity: number;
        note: string | null;
        internalCode: string | null;
        unit: string | null;
        unitPrice: number;
        totalValue: number;
    })[]>;
    getBudgetStatus(id: string): Promise<{
        materialId: number | null;
        materialName: string;
        unit: string | null;
        budgeted: number;
        requested: number;
        remaining: number;
    }[]>;
    importBudgets(id: string, data: {
        budgets: any[];
    }): Promise<{
        message: string;
        count: number;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        location: string;
        startDate: Date;
        endDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        location: string;
        startDate: Date;
        endDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
