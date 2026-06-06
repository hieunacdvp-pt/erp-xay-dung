import { PrismaService } from '../prisma/prisma.service';
export declare class ProcurementService {
    private prisma;
    constructor(prisma: PrismaService);
    createPR(data: any): Promise<{
        items: {
            id: number;
            materialId: number;
            quantity: number;
            purchaseRequestId: number;
        }[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    }>;
    findAllPRs(): Promise<({
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
        items: ({
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
            materialId: number;
            quantity: number;
            purchaseRequestId: number;
        })[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    })[]>;
    approvePR(id: number, level: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    }>;
    updatePR(id: number, data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    }>;
    deletePR(id: number): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    }>;
    createPO(data: any): Promise<{
        items: {
            id: number;
            materialId: number;
            quantity: number;
            unitPrice: number;
            purchaseOrderId: number;
        }[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        vatAmount: number;
        invoiceNumber: string | null;
        vendorId: number;
        totalAmount: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
        code: string;
        isDirectToSite: boolean;
    }>;
    findAllPOs(): Promise<({
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
        vendor: {
            id: number;
            createdAt: Date;
            name: string;
            phone: string | null;
            taxId: string | null;
            address: string | null;
        };
        items: ({
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
            materialId: number;
            quantity: number;
            unitPrice: number;
            purchaseOrderId: number;
        })[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        vatAmount: number;
        invoiceNumber: string | null;
        vendorId: number;
        totalAmount: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
        code: string;
        isDirectToSite: boolean;
    })[]>;
    approvePO(id: number, level: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        vatAmount: number;
        invoiceNumber: string | null;
        vendorId: number;
        totalAmount: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
        code: string;
        isDirectToSite: boolean;
    }>;
    updatePO(id: number, data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        vatAmount: number;
        invoiceNumber: string | null;
        vendorId: number;
        totalAmount: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
        code: string;
        isDirectToSite: boolean;
    }>;
    deletePO(id: number): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        vatAmount: number;
        invoiceNumber: string | null;
        vendorId: number;
        totalAmount: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
        code: string;
        isDirectToSite: boolean;
    }>;
    receivePO(id: number, invoiceNumber?: string): Promise<{
        message: string;
    }>;
}
