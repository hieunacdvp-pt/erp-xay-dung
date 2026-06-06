import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        role: string;
    }[]>;
    login(username: string, password: string): Promise<{
        id: number;
        username: string;
        role: string;
    }>;
    generateRegistrationOptions(username: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
    verifyRegistration(username: string, body: any): Promise<{
        verified: boolean;
    }>;
    generateAuthenticationOptions(username: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialRequestOptionsJSON>;
    verifyAuthentication(username: string, body: any): Promise<{
        verified: boolean;
        user: {
            id: number;
            username: string;
            role: string;
        };
    } | {
        verified: boolean;
        user?: undefined;
    }>;
}
