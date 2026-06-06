import { PrismaService } from '../prisma/prisma.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';
export declare class RequisitionsService {
    private readonly prisma;
    private readonly auditLogs;
    constructor(prisma: PrismaService, auditLogs: AuditlogsService);
    create(createRequisitionDto: any): Promise<{
        items: {
            id: number;
            materialId: number;
            quantity: number;
            requisitionId: number;
            approvedQuantity: number | null;
        }[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        note: string | null;
        status: string;
        updatedAt: Date;
        requesterId: number | null;
        isOverBudget: boolean;
    }>;
    findAll(): Promise<({
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
        requester: {
            id: number;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            role: string;
            phone: string | null;
            salaryPerDay: number;
            idCardNumber: string | null;
            idCardUrl: string | null;
            contractUrl: string | null;
            contractType: string | null;
            hasTaxCommitment: boolean;
        } | null;
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
            requisitionId: number;
            approvedQuantity: number | null;
        })[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        note: string | null;
        status: string;
        updatedAt: Date;
        requesterId: number | null;
        isOverBudget: boolean;
    })[]>;
    findOne(id: number): Promise<({
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
        requester: {
            id: number;
            createdAt: Date;
            name: string;
            status: string;
            updatedAt: Date;
            role: string;
            phone: string | null;
            salaryPerDay: number;
            idCardNumber: string | null;
            idCardUrl: string | null;
            contractUrl: string | null;
            contractType: string | null;
            hasTaxCommitment: boolean;
        } | null;
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
            requisitionId: number;
            approvedQuantity: number | null;
        })[];
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        note: string | null;
        status: string;
        updatedAt: Date;
        requesterId: number | null;
        isOverBudget: boolean;
    }) | null>;
    approve(id: number, username: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        note: string | null;
        status: string;
        updatedAt: Date;
        requesterId: number | null;
        isOverBudget: boolean;
    }>;
    reject(id: number, username: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        note: string | null;
        status: string;
        updatedAt: Date;
        requesterId: number | null;
        isOverBudget: boolean;
    }>;
    fulfill(id: number, username: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        note: string | null;
        status: string;
        updatedAt: Date;
        requesterId: number | null;
        isOverBudget: boolean;
    }>;
}
