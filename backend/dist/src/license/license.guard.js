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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseGuard = void 0;
const common_1 = require("@nestjs/common");
const license_service_1 = require("./license.service");
let LicenseGuard = class LicenseGuard {
    licenseService;
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        if (url.includes('/auth/login') || url.includes('/license')) {
            return true;
        }
        const licenseStatus = await this.licenseService.getLicenseStatus();
        if (licenseStatus.isExpired) {
            throw new common_1.HttpException({
                isLocked: true,
                message: 'Phần mềm đã hết hạn bản quyền hoặc dùng thử. Vui lòng liên hệ nhà cung cấp.',
                status: licenseStatus
            }, common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        return true;
    }
};
exports.LicenseGuard = LicenseGuard;
exports.LicenseGuard = LicenseGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [license_service_1.LicenseService])
], LicenseGuard);
//# sourceMappingURL=license.guard.js.map