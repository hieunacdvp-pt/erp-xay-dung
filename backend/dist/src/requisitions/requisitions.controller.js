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
exports.RequisitionsController = void 0;
const common_1 = require("@nestjs/common");
const requisitions_service_1 = require("./requisitions.service");
let RequisitionsController = class RequisitionsController {
    requisitionsService;
    constructor(requisitionsService) {
        this.requisitionsService = requisitionsService;
    }
    create(createRequisitionDto) {
        return this.requisitionsService.create(createRequisitionDto);
    }
    findAll() {
        return this.requisitionsService.findAll();
    }
    findOne(id) {
        return this.requisitionsService.findOne(+id);
    }
    approve(id, data) {
        return this.requisitionsService.approve(+id, data.username);
    }
    reject(id, data) {
        return this.requisitionsService.reject(+id, data.username);
    }
    fulfill(id, data) {
        return this.requisitionsService.fulfill(+id, data);
    }
};
exports.RequisitionsController = RequisitionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequisitionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequisitionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequisitionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequisitionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequisitionsController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/fulfill'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequisitionsController.prototype, "fulfill", null);
exports.RequisitionsController = RequisitionsController = __decorate([
    (0, common_1.Controller)('requisitions'),
    __metadata("design:paramtypes", [requisitions_service_1.RequisitionsService])
], RequisitionsController);
//# sourceMappingURL=requisitions.controller.js.map