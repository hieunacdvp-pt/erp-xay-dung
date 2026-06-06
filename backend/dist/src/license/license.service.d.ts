import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export interface LicensePayload {
    clientName: string;
    domain: string;
    type: 'TRIAL' | 'PAID';
    expiryDate: string;
}
export interface LicenseStatus {
    isValid: boolean;
    isExpired: boolean;
    daysLeft: number;
    type: 'TRIAL' | 'PAID' | 'NONE';
    clientName: string;
    shouldWarn: boolean;
    warningMessage?: string;
    expiryDate?: string;
}
export declare class LicenseService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getLicenseStatus(): Promise<LicenseStatus>;
    activateLicense(key: string): Promise<boolean>;
}
