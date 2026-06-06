import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class AttendancesController {
    private readonly attendancesService;
    constructor(attendancesService: AttendancesService);
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
    findAll(projectId?: string, date?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    remove(id: string): import("@prisma/client").Prisma.Prisma__AttendanceClient<{
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
    getPayroll(projectId: string, month: string): never[] | Promise<{
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
    getPayrollSummary(month: string): Promise<any[]> | never[];
    savePayslip(id: string, data: any): Promise<{
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
    accountPayroll(body: {
        projectId: number;
        month: string;
    }): Promise<{
        message: string;
    }>;
    payPayroll(body: {
        projectId: number;
        month: string;
        accountId: number;
    }): Promise<{
        message: string;
    }>;
}
