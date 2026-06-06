import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Res, Param, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { SystemSettingsService } from './system-settings.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  getSettings() {
    return this.systemSettingsService.getSettings();
  }

  @Post()
  updateSettings(@Body() body: any) {
    const promises = [];
    for (const key in body) {
      promises.push(this.systemSettingsService.updateSetting(key, body[key]));
    }
    return Promise.all(promises);
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, 'logo' + file.originalname.substring(file.originalname.lastIndexOf('.')));
      }
    })
  }))
  async uploadLogo(@UploadedFile() file: any) {
    const fileUrl = `http://localhost:3000/system-settings/logo/${file.filename}`;
    await this.systemSettingsService.updateSetting('companyLogo', fileUrl);
    return { url: fileUrl };
  }

  @Get('logo/:filename')
  getLogo(@Param('filename') filename: string) {
    const file = createReadStream(join(process.cwd(), 'uploads', filename));
    return new StreamableFile(file);
  }

  @Post('reset-trial-data')
  resetTrialData() {
    return this.systemSettingsService.resetTrialData();
  }
}
