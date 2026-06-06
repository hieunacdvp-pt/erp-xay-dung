import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class AttendancesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrUpdate(createAttendanceDto: CreateAttendanceDto): Promise<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        personnelId: number;
        status: string;
        updatedAt: Date;
        address: string | null;
        timeIn: Date | null;
        timeOut: Date | null;
        latitude: number | null;
        longitude: number | null;
        photoUrl: string | null;
    }>;
    findByProjectAndDate(projectId: number, dateString: string): import("@prisma/client").Prisma.PrismaPromise<({
        personnel: {
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
        };
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        personnelId: number;
        status: string;
        updatedAt: Date;
        address: string | null;
        timeIn: Date | null;
        timeOut: Date | null;
        latitude: number | null;
        longitude: number | null;
        photoUrl: string | null;
    })[]>;
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
        personnel: {
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
        };
    } & {
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        personnelId: number;
        status: string;
        updatedAt: Date;
        address: string | null;
        timeIn: Date | null;
        timeOut: Date | null;
        latitude: number | null;
        longitude: number | null;
        photoUrl: string | null;
    })[]>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__AttendanceClient<{
        id: number;
        date: Date;
        createdAt: Date;
        projectId: number;
        personnelId: number;
        status: string;
        updatedAt: Date;
        address: string | null;
        timeIn: Date | null;
        timeOut: Date | null;
        latitude: number | null;
        longitude: number | null;
        photoUrl: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getPayroll(projectId: number, month: string): Promise<{
        personnel: any;
        id: number;
        createdAt: Date;
        projectId: number;
        personnelId: number;
        status: string;
        month: string;
        updatedAt: Date;
        standardDays: number;
        baseSalary: number;
        allowance: number;
        overtimePay: number;
        bonus: number;
        deduction: number;
        insurance: number;
        advance: number;
        netPay: number;
    }[]>;
    savePayslip(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        projectId: number;
        personnelId: number;
        status: string;
        month: string;
        updatedAt: Date;
        standardDays: number;
        baseSalary: number;
        allowance: number;
        overtimePay: number;
        bonus: number;
        deduction: number;
        insurance: number;
        advance: number;
        netPay: number;
    }>;
    accountPayroll(projectId: number, month: string): Promise<{
        message: string;
    }>;
    payPayroll(projectId: number, month: string, accountId: number): Promise<{
        message: string;
    }>;
    getPayrollSummary(month: string): Promise<any[]>;
}
