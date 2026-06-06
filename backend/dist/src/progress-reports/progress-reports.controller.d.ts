import { ProgressReportsService } from './progress-reports.service';
export declare class ProgressReportsController {
    private readonly progressReportsService;
    constructor(progressReportsService: ProgressReportsService);
    create(createProgressReportDto: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        content: string;
        weather: string | null;
        imageUrls: string | null;
        reporterId: number | null;
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
        reporter: {
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
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        content: string;
        weather: string | null;
        imageUrls: string | null;
        reporterId: number | null;
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
        reporter: {
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
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        content: string;
        weather: string | null;
        imageUrls: string | null;
        reporterId: number | null;
    }) | null>;
    remove(id: string, data: any): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        content: string;
        weather: string | null;
        imageUrls: string | null;
        reporterId: number | null;
    }>;
}
