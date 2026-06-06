import { LicenseService } from './license.service';
export declare class LicenseController {
    private readonly licenseService;
    constructor(licenseService: LicenseService);
    getStatus(): Promise<import("./license.service").LicenseStatus>;
    activate(key: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
