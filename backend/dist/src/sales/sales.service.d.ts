import { PrismaService } from '../prisma/prisma.service';
export declare class SalesService {
    private prisma;
    constructor(prisma: PrismaService);
    getInvoices(projectId?: number): import("@prisma/client").Prisma.PrismaPromise<({
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
        customer: {
            id: number;
            createdAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            taxCode: string | null;
        };
    } & {
        id: number;
        date: Date;
        description: string;
        projectId: number;
        amount: number;
        vatRate: number;
        vatAmount: number;
        customerId: number;
        totalAmount: number;
        costTransferPercentage: number;
        retentionPercentage: number;
        retentionAmount: number;
        status: string;
    })[]>;
    createInvoice(data: any): Promise<{
        id: number;
        date: Date;
        description: string;
        projectId: number;
        amount: number;
        vatRate: number;
        vatAmount: number;
        customerId: number;
        totalAmount: number;
        costTransferPercentage: number;
        retentionPercentage: number;
        retentionAmount: number;
        status: string;
    }>;
}
