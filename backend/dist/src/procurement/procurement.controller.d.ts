import { ProcurementService } from './procurement.service';
export declare class ProcurementController {
    private readonly procurementService;
    constructor(procurementService: ProcurementService);
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
    approvePR(id: string, level: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    }>;
    updatePR(id: string, data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        notes: string | null;
        updatedAt: Date;
    }>;
    deletePR(id: string): Promise<{
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
    approvePO(id: string, level: string): Promise<{
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
    updatePO(id: string, data: any): Promise<{
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
    deletePO(id: string): Promise<{
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
    receivePO(id: string, body: {
        invoiceNumber?: string;
    }): Promise<{
        message: string;
    }>;
}
