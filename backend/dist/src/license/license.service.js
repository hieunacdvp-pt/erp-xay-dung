"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt = __importStar(require("jsonwebtoken"));
const LICENSE_SECRET = process.env.JWT_SECRET || "CONST_ERP_MASTER_SECRET_KEY_2026_DO_NOT_SHARE";
let LicenseService = class LicenseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const existing = await this.prisma.systemLicense.findFirst({ where: { status: 'ACTIVE' } });
        if (!existing) {
            const payload = {
                clientName: 'Demo Client',
                domain: '*',
                type: 'TRIAL',
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
            };
            const token = jwt.sign(payload, LICENSE_SECRET);
            await this.prisma.systemLicense.create({
                data: {
                    licenseKey: token,
                    status: 'ACTIVE'
                }
            });
            console.log('✅ Generated Initial 90-Day Trial License');
        }
    }
    async getLicenseStatus() {
        const license = await this.prisma.systemLicense.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { id: 'desc' }
        });
        if (!license) {
            return { isValid: false, isExpired: true, daysLeft: 0, type: 'NONE', clientName: '', shouldWarn: false };
        }
        try {
            const decoded = jwt.verify(license.licenseKey, LICENSE_SECRET);
            const expiryDate = new Date(decoded.expiryDate);
            const now = new Date();
            const diffTime = expiryDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isExpired = daysLeft <= 0;
            let shouldWarn = false;
            let warningMessage = '';
            if (!isExpired && decoded.type === 'TRIAL') {
                const totalTrialDays = 90;
                const daysPassed = totalTrialDays - daysLeft;
                if (daysLeft <= 10) {
                    shouldWarn = true;
                    warningMessage = `Phần mềm của bạn sắp hết hạn dùng thử (còn ${daysLeft} ngày). Ngày hết hạn: ${expiryDate.toLocaleDateString('vi-VN')}. Vui lòng liên hệ nhà cung cấp để mua bản quyền.`;
                }
                else if (daysPassed >= 0 && daysPassed % 10 === 0) {
                    shouldWarn = true;
                    warningMessage = `Bạn đang trong thời gian dùng thử (còn ${daysLeft} ngày). Hãy mua License Key để sử dụng lâu dài, phần mềm sẽ bị khóa sau ngày ${expiryDate.toLocaleDateString('vi-VN')} thử nghiệm.`;
                }
            }
            return {
                isValid: !isExpired,
                isExpired: isExpired,
                daysLeft: daysLeft > 0 ? daysLeft : 0,
                type: decoded.type,
                clientName: decoded.clientName,
                shouldWarn,
                warningMessage,
                expiryDate: expiryDate.toISOString()
            };
        }
        catch (err) {
            return { isValid: false, isExpired: true, daysLeft: 0, type: 'NONE', clientName: '', shouldWarn: false };
        }
    }
    async activateLicense(key) {
        try {
            const decoded = jwt.verify(key, LICENSE_SECRET);
            await this.prisma.systemLicense.updateMany({
                where: { status: 'ACTIVE' },
                data: { status: 'EXPIRED' }
            });
            await this.prisma.systemLicense.create({
                data: {
                    licenseKey: key,
                    status: 'ACTIVE'
                }
            });
            return true;
        }
        catch (err) {
            throw new common_1.HttpException('Mã kích hoạt không hợp lệ hoặc đã bị can thiệp', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LicenseService);
//# sourceMappingURL=license.service.js.map