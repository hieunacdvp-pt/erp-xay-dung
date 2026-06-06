import { Controller, Get, Post, Body } from '@nestjs/common';
import { LicenseService } from './license.service';

@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('status')
  async getStatus() {
    return this.licenseService.getLicenseStatus();
  }

  @Post('activate')
  async activate(@Body('key') key: string) {
    const success = await this.licenseService.activateLicense(key);
    return { success, message: 'Kích hoạt phần mềm thành công!' };
  }
}
