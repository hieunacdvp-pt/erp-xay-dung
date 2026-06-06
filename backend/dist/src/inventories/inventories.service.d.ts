import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class InventoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createInventoryDto: CreateInventoryDto): import("@prisma/client").Prisma.Prisma__InventoryClient<{
        id: number;
        projectId: number;
        materialId: number;
        quantity: number;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        project: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            location: string;
            startDate: Date;
            endDate: Date | null;
        };
        material: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            price: number;
            unit: string;
        };
    } & {
        id: number;
        projectId: number;
        materialId: number;
        quantity: number;
        updatedAt: Date;
    })[]>;
    findAllMovements(): import("@prisma/client").Prisma.PrismaPromise<({
        project: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            location: string;
            startDate: Date;
            endDate: Date | null;
        };
        material: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            price: number;
            unit: string;
        };
    } & {
        id: number;
        date: Date;
        projectId: number;
        type: string;
        vatRate: number;
        vatAmount: number;
        invoiceNumber: string | null;
        materialId: number;
        quantity: number;
        price: number;
        note: string | null;
        hasInvoice: boolean;
        vendorId: number | null;
    })[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__InventoryClient<({
        project: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            location: string;
            startDate: Date;
            endDate: Date | null;
        };
        material: {
            id: number;
            description: string | null;
            createdAt: Date;
            name: string;
            price: number;
            unit: string;
        };
    } & {
        id: number;
        projectId: number;
        materialId: number;
        quantity: number;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateInventoryDto: UpdateInventoryDto): import("@prisma/client").Prisma.Prisma__InventoryClient<{
        id: number;
        projectId: number;
        materialId: number;
        quantity: number;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__InventoryClient<{
        id: number;
        projectId: number;
        materialId: number;
        quantity: number;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
