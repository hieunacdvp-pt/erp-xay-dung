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
exports.AuditlogsController = void 0;
const common_1 = require("@nestjs/common");
const auditlogs_service_1 = require("./auditlogs.service");
let AuditlogsController = class AuditlogsController {
    auditlogsService;
    constructor(auditlogsService) {
        this.auditlogsService = auditlogsService;
    }
    findAll() {
        return this.auditlogsService.findAll();
    }
};
exports.AuditlogsController = AuditlogsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditlogsController.prototype, "findAll", null);
exports.AuditlogsController = AuditlogsController = __decorate([
    (0, common_1.Controller)('auditlogs'),
    __metadata("design:paramtypes", [auditlogs_service_1.AuditlogsService])
], AuditlogsController);
//# sourceMappingURL=auditlogs.controller.js.map