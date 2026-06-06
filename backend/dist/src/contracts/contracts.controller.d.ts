import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
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
    findOne(id: string): Promise<{
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
    update(id: string, updateContractDto: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    updateMilestoneStatus(id: string, body: any): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        amount: number;
        status: string;
        contractId: number;
        dueDate: Date | null;
    }>;
    addGuaranteeLetter(contractId: string, data: any): Promise<{
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
    updateGuaranteeLetter(id: string, data: any): Promise<{
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
    removeGuaranteeLetter(id: string): Promise<{
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
