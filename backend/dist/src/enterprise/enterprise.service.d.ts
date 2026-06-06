import { PrismaService } from '../prisma/prisma.service';
export declare class EnterpriseService {
    private readonly prisma;
    private settingsPath;
    constructor(prisma: PrismaService);
    getValuationMethod(): 'AVERAGE' | 'FIFO';
    setValuationMethod(method: 'AVERAGE' | 'FIFO'): {
        success: boolean;
        method: "AVERAGE" | "FIFO";
    };
    getVendors(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        taxId: string | null;
        address: string | null;
    }[]>;
    createVendor(data: any): import("@prisma/client").Prisma.Prisma__VendorClient<{
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        taxId: string | null;
        address: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateVendor(id: number, data: any): import("@prisma/client").Prisma.Prisma__VendorClient<{
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        taxId: string | null;
        address: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getDebts(): import("@prisma/client").Prisma.PrismaPromise<({
        vendor: {
            id: number;
            createdAt: Date;
            name: string;
            phone: string | null;
            taxId: string | null;
            address: string | null;
        } | null;
        customer: {
            id: number;
            createdAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            taxCode: string | null;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        type: string;
        amount: number;
        vendorId: number | null;
        customerId: number | null;
        status: string;
    })[]>;
    createDebt(data: any): import("@prisma/client").Prisma.Prisma__DebtClient<{
        id: number;
        createdAt: Date;
        type: string;
        amount: number;
        vendorId: number | null;
        customerId: number | null;
        status: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    payDebt(id: number, amount: number, accountId?: number, bankFee?: number): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        amount: number;
        vendorId: number | null;
        customerId: number | null;
        status: string;
    }>;
    recordSales(data: {
        customerId: number;
        amount: number;
        note?: string;
    }): import("@prisma/client").Prisma.Prisma__DebtClient<{
        id: number;
        createdAt: Date;
        type: string;
        amount: number;
        vendorId: number | null;
        customerId: number | null;
        status: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getMovements(): import("@prisma/client").Prisma.PrismaPromise<({
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
    createMovement(data: any): Promise<{
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
    }>;
    getAccounts(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        type: string;
        code: string;
    }[]>;
    getJournalEntries(): import("@prisma/client").Prisma.PrismaPromise<({
        lines: ({
            account: {
                name: string;
                type: string;
                code: string;
            };
        } & {
            id: number;
            debit: number;
            credit: number;
            accountCode: string;
            journalEntryId: number;
        })[];
    } & {
        id: number;
        date: Date;
        description: string;
        createdAt: Date;
        isReverted: boolean;
        revertedById: number | null;
        originalEntryId: number | null;
        projectId: number | null;
        transactionId: number | null;
        movementId: number | null;
        salesInvoiceId: number | null;
        assetAllocationId: number | null;
        equipmentUsageId: number | null;
    })[]>;
    getTrialBalance(): Promise<any[]>;
}
