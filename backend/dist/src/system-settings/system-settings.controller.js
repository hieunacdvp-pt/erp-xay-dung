"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingsController = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const system_settings_service_1 = require("./system-settings.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let SystemSettingsController = class SystemSettingsController {
    systemSettingsService;
    constructor(systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }
    getSettings() {
        return this.systemSettingsService.getSettings();
    }
    updateSettings(body) {
        const promises = [];
        for (const key in body) {
            promises.push(this.systemSettingsService.updateSetting(key, body[key]));
        }
        return Promise.all(promises);
    }
    async uploadLogo(file) {
        const fileUrl = `http://localhost:3000/system-settings/logo/${file.filename}`;
        await this.systemSettingsService.updateSetting('companyLogo', fileUrl);
        return { url: fileUrl };
    }
    getLogo(filename) {
        const file = (0, fs_1.createReadStream)((0, path_1.join)(process.cwd(), 'uploads', filename));
        return new common_1.StreamableFile(file);
    }
    resetTrialData() {
        return this.systemSettingsService.resetTrialData();
    }
};
exports.SystemSettingsController = SystemSettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('upload-logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                cb(null, 'logo' + file.originalname.substring(file.originalname.lastIndexOf('.')));
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Get)('logo/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "getLogo", null);
__decorate([
    (0, common_1.Post)('reset-trial-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "resetTrialData", null);
exports.SystemSettingsController = SystemSettingsController = __decorate([
    (0, common_1.Controller)('system-settings'),
    __metadata("design:paramtypes", [system_settings_service_1.SystemSettingsService])
], SystemSettingsController);
//# sourceMappingURL=system-settings.controller.js.map