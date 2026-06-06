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
exports.EnterpriseController = void 0;
const common_1 = require("@nestjs/common");
const enterprise_service_1 = require("./enterprise.service");
let EnterpriseController = class EnterpriseController {
    service;
    constructor(service) {
        this.service = service;
    }
    getSettings() { return { valuationMethod: this.service.getValuationMethod() }; }
    setSettings(method) { return this.service.setValuationMethod(method); }
    getVendors() { return this.service.getVendors(); }
    createVendor(body) { return this.service.createVendor(body); }
    updateVendor(id, body) { return this.service.updateVendor(+id, body); }
    getDebts() { return this.service.getDebts(); }
    createDebt(body) { return this.service.createDebt(body); }
    payDebt(id, amount, accountId, bankFee) {
        return this.service.payDebt(+id, amount, accountId, bankFee);
    }
    recordSales(body) {
        return this.service.recordSales(body);
    }
    getMovements() { return this.service.getMovements(); }
    createMovement(body) { return this.service.createMovement(body); }
    getAccounts() { return this.service.getAccounts(); }
    getJournalEntries() { return this.service.getJournalEntries(); }
    getTrialBalance() { return this.service.getTrialBalance(); }
};
exports.EnterpriseController = EnterpriseController;
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('settings'),
    __param(0, (0, common_1.Body)('valuationMethod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "setSettings", null);
__decorate([
    (0, common_1.Get)('vendors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getVendors", null);
__decorate([
    (0, common_1.Post)('vendors'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "createVendor", null);
__decorate([
    (0, common_1.Patch)('vendors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "updateVendor", null);
__decorate([
    (0, common_1.Get)('debts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getDebts", null);
__decorate([
    (0, common_1.Post)('debts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "createDebt", null);
__decorate([
    (0, common_1.Patch)('debts/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('accountId')),
    __param(3, (0, common_1.Body)('bankFee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "payDebt", null);
__decorate([
    (0, common_1.Post)('sales'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "recordSales", null);
__decorate([
    (0, common_1.Get)('movements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Post)('movements'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "createMovement", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)('journals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getJournalEntries", null);
__decorate([
    (0, common_1.Get)('trial-balance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseController.prototype, "getTrialBalance", null);
exports.EnterpriseController = EnterpriseController = __decorate([
    (0, common_1.Controller)('enterprise'),
    __metadata("design:paramtypes", [enterprise_service_1.EnterpriseService])
], EnterpriseController);
//# sourceMappingURL=enterprise.controller.js.map