import { SubcontractorsService } from './subcontractors.service';
import { CreateSubcontractorDto } from './dto/create-subcontractor.dto';
import { UpdateSubcontractorDto } from './dto/update-subcontractor.dto';
export declare class SubcontractorsController {
    private readonly subcontractorsService;
    constructor(subcontractorsService: SubcontractorsService);
    create(createSubcontractorDto: CreateSubcontractorDto): import("@prisma/client").Prisma.Prisma__SubcontractorClient<{
        id: number;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__SubcontractorClient<({
        transactions: {
            id: number;
            date: Date;
            description: string | null;
            createdAt: Date;
            projectId: number | null;
            type: string;
            amount: number;
            bankFee: number;
            category: string;
            vatRate: number;
            vatAmount: number;
            accountId: number;
            personnelId: number | null;
            internalTransferId: number | null;
            subcontractorId: number | null;
            isDirectMaterial: boolean;
            invoiceNumber: string | null;
        }[];
        contracts: {
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
        }[];
    } & {
        id: number;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateSubcontractorDto: UpdateSubcontractorDto): import("@prisma/client").Prisma.Prisma__SubcontractorClient<{
        id: number;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__SubcontractorClient<{
        id: number;
        createdAt: Date;
        name: string;
        status: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
