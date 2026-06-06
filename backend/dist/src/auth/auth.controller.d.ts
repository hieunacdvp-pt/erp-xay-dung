import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getUsers(): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        role: string;
    }[]>;
    login(body: any): Promise<{
        id: number;
        username: string;
        role: string;
    }>;
    getRegistrationOptions(username: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
    verifyRegistration(username: string, body: any): Promise<{
        verified: boolean;
    }>;
    getAuthenticationOptions(username: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialRequestOptionsJSON>;
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
