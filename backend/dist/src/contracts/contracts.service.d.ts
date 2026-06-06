import { PrismaService } from '../prisma/prisma.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';
export declare class ContractsService {
    private prisma;
    private auditLogger;
    constructor(prisma: PrismaService, auditLogger: AuditlogsService);
    create(createContractDto: any): Promise<{
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
        } | null;
        milestones: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            amount: number;
            status: string;
            contractId: number;
            dueDate: Date | null;
        }[];
        guaranteeLetters: {
            id: number;
            createdAt: Date;
            type: string;
            status: string;
            notes: string | null;
            bankName: string;
            value: number;
            contractId: number;
            issueDate: Date;
            expiryDate: Date;
        }[];
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
    }>;
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
        customer: {
            id: number;
            createdAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            taxCode: string | null;
        } | null;
        milestones: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            amount: number;
            status: string;
            contractId: number;
            dueDate: Date | null;
        }[];
        guaranteeLetters: {
            id: number;
            createdAt: Date;
            type: string;
            status: string;
            notes: string | null;
            bankName: string;
            value: number;
            contractId: number;
            issueDate: Date;
            expiryDate: Date;
        }[];
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
    })[]>;
    findOne(id: number): Promise<{
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
        } | null;
        milestones: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            amount: number;
            status: string;
            contractId: number;
            dueDate: Date | null;
        }[];
        guaranteeLetters: {
            id: number;
            createdAt: Date;
            type: string;
            status: string;
            notes: string | null;
            bankName: string;
            value: number;
            contractId: number;
            issueDate: Date;
            expiryDate: Date;
        }[];
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
    }>;
    update(id: number, updateContractDto: any): Promise<{
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
        } | null;
        milestones: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            amount: number;
            status: string;
            contractId: number;
            dueDate: Date | null;
        }[];
        guaranteeLetters: {
            id: number;
            createdAt: Date;
            type: string;
            status: string;
            notes: string | null;
            bankName: string;
            value: number;
            contractId: number;
            issueDate: Date;
            expiryDate: Date;
        }[];
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
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    updateMilestoneStatus(milestoneId: number, body: any): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        amount: number;
        status: string;
        contractId: number;
        dueDate: Date | null;
    }>;
    addGuaranteeLetter(contractId: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        status: string;
        notes: string | null;
        bankName: string;
        value: number;
        contractId: number;
        issueDate: Date;
        expiryDate: Date;
    }>;
    updateGuaranteeLetter(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        status: string;
        notes: string | null;
        bankName: string;
        value: number;
        contractId: number;
        issueDate: Date;
        expiryDate: Date;
    }>;
    removeGuaranteeLetter(id: number): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        status: string;
        notes: string | null;
        bankName: string;
        value: number;
        contractId: number;
        issueDate: Date;
        expiryDate: Date;
    }>;
}
