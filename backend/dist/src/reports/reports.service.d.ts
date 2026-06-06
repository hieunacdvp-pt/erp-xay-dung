import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProjectPnL(projectId: number, startDate?: string, endDate?: string): Promise<{
        project: {
            id: number;
            name: string;
            totalBudget: number;
        };
        revenue: number;
        totalPaid: number;
        payments: {
            date: Date;
            amount: number;
            description: string | null;
        }[];
        costs: {
            material: number;
            labor: number;
            asset: number;
            other: number;
            total: number;
        };
        details: {
            materials: {
                id: number;
                date: Date;
                name: string;
                quantity: number;
                price: number;
                total: number;
            }[];
            labor: {
                id: number;
                date: Date;
                name: string;
                amount: number;
            }[];
            asset: {
                id: number;
                date: Date;
                name: string;
                amount: number;
            }[];
            other: {
                id: number;
                date: Date;
                description: string | null;
                amount: number;
            }[];
        };
        grossProfit: number;
        profitMargin: number;
    }>;
    getAllProjectsPnL(startDate?: string, endDate?: string): Promise<{
        projects: {
            project: {
                id: number;
                name: string;
                totalBudget: number;
            };
            revenue: number;
            totalPaid: number;
            payments: {
                date: Date;
                amount: number;
                description: string | null;
            }[];
            costs: {
                material: number;
                labor: number;
                asset: number;
                other: number;
                total: number;
            };
            details: {
                materials: {
                    id: number;
                    date: Date;
                    name: string;
                    quantity: number;
                    price: number;
                    total: number;
                }[];
                labor: {
                    id: number;
                    date: Date;
                    name: string;
                    amount: number;
                }[];
                asset: {
                    id: number;
                    date: Date;
                    name: string;
                    amount: number;
                }[];
                other: {
                    id: number;
                    date: Date;
                    description: string | null;
                    amount: number;
                }[];
            };
            grossProfit: number;
            profitMargin: number;
        }[];
        overhead: {
            total: number;
            details: {
                id: any;
                date: any;
                description: any;
                amount: any;
                category: any;
            }[];
        };
        cashflowWarning: {
            totalCash: number;
            totalTaxPayable: number;
        };
    }>;
    getTaxExcel(res: any, month: number, year: number): Promise<void>;
}
