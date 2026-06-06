import { StreamableFile } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
export declare class SystemSettingsController {
    private readonly systemSettingsService;
    constructor(systemSettingsService: SystemSettingsService);
    getSettings(): Promise<Record<string, string>>;
    updateSettings(body: any): Promise<{
        id: number;
        key: string;
        value: string;
    }[]>;
    uploadLogo(file: any): Promise<{
        url: string;
    }>;
    getLogo(filename: string): StreamableFile;
    resetTrialData(): Promise<{
        success: boolean;
        message: string;
    }>;
}
