import { PrismaService } from '../prisma/prisma.service';
export declare class AccountingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTrialBalance(startDate?: string, endDate?: string): Promise<{
        debit: any;
        credit: any;
        finalBalance: number;
        name: string;
        type: string;
        code: string;
    }[]>;
    getGeneralLedger(accountCode: string, startDate?: string, endDate?: string, projectId?: number): Promise<{
        id: number;
        date: Date;
        description: string;
        project: string | undefined;
        debit: number;
        credit: number;
    }[]>;
    getPnl(projectId?: number, startDate?: string, endDate?: string): Promise<{
        project: {
            contract: ({
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
                projectId: number;
                vatRate: number;
                note: string | null;
                customerId: number | null;
                status: string;
                updatedAt: Date;
                startDate: Date;
                endDate: Date | null;
                contractNumber: string;
                customerName: string | null;
                value: number;
            }) | null;
        } & {
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
        revenue: number;
        costMaterial: number;
        costLabor: number;
        costEquipment: number;
        costSubcontractor: number;
        costGeneral: number;
        totalCost: number;
        grossProfit: number;
    }[]>;
}
