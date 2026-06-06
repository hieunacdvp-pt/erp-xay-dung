import { EquipmentService } from './equipment.service';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        status: string;
        updatedAt: Date;
        code: string;
        ownership: string;
        dailyCost: number;
    }[]>;
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        status: string;
        updatedAt: Date;
        code: string;
        ownership: string;
        dailyCost: number;
    }>;
    update(id: string, data: any): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        status: string;
        updatedAt: Date;
        code: string;
        ownership: string;
        dailyCost: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        status: string;
        updatedAt: Date;
        code: string;
        ownership: string;
        dailyCost: number;
    }>;
    findAllDispatches(): Promise<({
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
        equipment: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            status: string;
            updatedAt: Date;
            code: string;
            ownership: string;
            dailyCost: number;
        };
    } & {
        id: number;
        createdAt: Date;
        projectId: number;
        equipmentId: number;
        notes: string | null;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
    })[]>;
    createDispatch(data: any): Promise<{
        id: number;
        createdAt: Date;
        projectId: number;
        equipmentId: number;
        notes: string | null;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
    }>;
    updateDispatch(id: string, data: any): Promise<{
        id: number;
        createdAt: Date;
        projectId: number;
        equipmentId: number;
        notes: string | null;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
    }>;
    removeDispatch(id: string): Promise<{
        id: number;
        createdAt: Date;
        projectId: number;
        equipmentId: number;
        notes: string | null;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
    }>;
    findAllUsages(): Promise<({
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
        equipment: {
            id: number;
            createdAt: Date;
            name: string;
            type: string;
            status: string;
            updatedAt: Date;
            code: string;
            ownership: string;
            dailyCost: number;
        };
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        equipmentId: number;
        shifts: number;
        costPerShift: number;
        totalCost: number;
        approvedBy: string | null;
        notes: string | null;
        updatedAt: Date;
    })[]>;
    createUsage(data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        equipmentId: number;
        shifts: number;
        costPerShift: number;
        totalCost: number;
        approvedBy: string | null;
        notes: string | null;
        updatedAt: Date;
    }>;
    updateUsage(id: string, data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        equipmentId: number;
        shifts: number;
        costPerShift: number;
        totalCost: number;
        approvedBy: string | null;
        notes: string | null;
        updatedAt: Date;
    }>;
    approveUsage(id: string, approvedBy: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        equipmentId: number;
        shifts: number;
        costPerShift: number;
        totalCost: number;
        approvedBy: string | null;
        notes: string | null;
        updatedAt: Date;
    }>;
    removeUsage(id: string): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        status: string;
        equipmentId: number;
        shifts: number;
        costPerShift: number;
        totalCost: number;
        approvedBy: string | null;
        notes: string | null;
        updatedAt: Date;
    }>;
}
