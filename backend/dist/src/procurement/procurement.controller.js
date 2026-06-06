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
exports.ProcurementController = void 0;
const common_1 = require("@nestjs/common");
const procurement_service_1 = require("./procurement.service");
let ProcurementController = class ProcurementController {
    procurementService;
    constructor(procurementService) {
        this.procurementService = procurementService;
    }
    createPR(data) {
        return this.procurementService.createPR(data);
    }
    findAllPRs() {
        return this.procurementService.findAllPRs();
    }
    approvePR(id, level) {
        return this.procurementService.approvePR(+id, level);
    }
    updatePR(id, data) {
        return this.procurementService.updatePR(+id, data);
    }
    deletePR(id) {
        return this.procurementService.deletePR(+id);
    }
    createPO(data) {
        return this.procurementService.createPO(data);
    }
    findAllPOs() {
        return this.procurementService.findAllPOs();
    }
    approvePO(id, level) {
        return this.procurementService.approvePO(+id, level);
    }
    updatePO(id, data) {
        return this.procurementService.updatePO(+id, data);
    }
    deletePO(id) {
        return this.procurementService.deletePO(+id);
    }
    receivePO(id, body) {
        return this.procurementService.receivePO(+id, body?.invoiceNumber);
    }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, common_1.Post)('pr'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "createPR", null);
__decorate([
    (0, common_1.Get)('pr'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "findAllPRs", null);
__decorate([
    (0, common_1.Patch)('pr/:id/approve/:level'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "approvePR", null);
__decorate([
    (0, common_1.Patch)('pr/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "updatePR", null);
__decorate([
    (0, common_1.Delete)('pr/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "deletePR", null);
__decorate([
    (0, common_1.Post)('po'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "createPO", null);
__decorate([
    (0, common_1.Get)('po'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "findAllPOs", null);
__decorate([
    (0, common_1.Patch)('po/:id/approve/:level'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "approvePO", null);
__decorate([
    (0, common_1.Patch)('po/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "updatePO", null);
__decorate([
    (0, common_1.Delete)('po/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "deletePO", null);
__decorate([
    (0, common_1.Post)('po/:id/receive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "receivePO", null);
exports.ProcurementController = ProcurementController = __decorate([
    (0, common_1.Controller)('procurement'),
    __metadata("design:paramtypes", [procurement_service_1.ProcurementService])
], ProcurementController);
//# sourceMappingURL=procurement.controller.js.map