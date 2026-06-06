import { PrismaService } from '../prisma/prisma.service';
export declare class SystemSettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<Record<string, string>>;
    updateSetting(key: string, value: string): Promise<{
        id: number;
        key: string;
        value: string;
    }>;
    resetTrialData(): Promise<{
        success: boolean;
        message: string;
    }>;
}
