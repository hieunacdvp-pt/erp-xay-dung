import { PrismaService } from '../prisma/prisma.service';
export declare class AssetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAssets(): import("@prisma/client").Prisma.PrismaPromise<({
        allocations: {
            id: number;
            date: Date;
            createdAt: Date;
            projectId: number;
            amount: number;
            assetId: number;
            month: string;
        }[];
    } & {
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        vendorId: number | null;
        purchasePrice: number;
        purchaseDate: Date;
        depreciationMonths: number;
    })[]>;
    createAsset(data: any): import("@prisma/client").Prisma.Prisma__AssetClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        vendorId: number | null;
        purchasePrice: number;
        purchaseDate: Date;
        depreciationMonths: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getAllocations(): import("@prisma/client").Prisma.PrismaPromise<({
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
        asset: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            vendorId: number | null;
            purchasePrice: number;
            purchaseDate: Date;
            depreciationMonths: number;
        };
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        amount: number;
        assetId: number;
        month: string;
    })[]>;
    createAllocation(data: any): import("@prisma/client").Prisma.Prisma__AssetAllocationClient<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        amount: number;
        assetId: number;
        month: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    runMonthlyDepreciation(assetId: number, projectId: number, month: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        amount: number;
        assetId: number;
        month: string;
    }>;
}
