import { SubcontractsService } from './subcontracts.service';
export declare class SubcontractsController {
    private readonly subcontractsService;
    constructor(subcontractsService: SubcontractsService);
    create(data: any): import("@prisma/client").Prisma.Prisma__SubcontractClient<{
        id: number;
        createdAt: Date;
        projectId: number;
        name: string;
        subcontractorId: number;
        status: string;
        updatedAt: Date;
        code: string;
        totalValue: number;
        startDate: Date;
        endDate: Date | null;
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
        subcontractor: {
            id: number;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            taxCode: string | null;
        };
        acceptances: {
            id: number;
            date: Date;
            createdAt: Date;
            note: string | null;
            acceptedValue: number;
            subcontractId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        projectId: number;
        name: string;
        subcontractorId: number;
        status: string;
        updatedAt: Date;
        code: string;
        totalValue: number;
        startDate: Date;
        endDate: Date | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__SubcontractClient<({
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
        subcontractor: {
            id: number;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            taxCode: string | null;
        };
        acceptances: {
            id: number;
            date: Date;
            createdAt: Date;
            note: string | null;
            acceptedValue: number;
            subcontractId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        projectId: number;
        name: string;
        subcontractorId: number;
        status: string;
        updatedAt: Date;
        code: string;
        totalValue: number;
        startDate: Date;
        endDate: Date | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import("@prisma/client").Prisma.Prisma__SubcontractClient<{
        id: number;
        createdAt: Date;
        projectId: number;
        name: string;
        subcontractorId: number;
        status: string;
        updatedAt: Date;
        code: string;
        totalValue: number;
        startDate: Date;
        endDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    createAcceptance(id: string, data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        note: string | null;
        acceptedValue: number;
        subcontractId: number;
    }>;
}
