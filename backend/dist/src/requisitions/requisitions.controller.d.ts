import { RequisitionsService } from './requisitions.service';
export declare class RequisitionsController {
    private readonly requisitionsService;
    constructor(requisitionsService: RequisitionsService);
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
    findOne(id: string): Promise<({
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
    approve(id: string, data: any): Promise<{
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
    reject(id: string, data: any): Promise<{
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
    fulfill(id: string, data: any): Promise<{
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
