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
exports.SubcontractorsController = void 0;
const common_1 = require("@nestjs/common");
const subcontractors_service_1 = require("./subcontractors.service");
const create_subcontractor_dto_1 = require("./dto/create-subcontractor.dto");
const update_subcontractor_dto_1 = require("./dto/update-subcontractor.dto");
let SubcontractorsController = class SubcontractorsController {
    subcontractorsService;
    constructor(subcontractorsService) {
        this.subcontractorsService = subcontractorsService;
    }
    create(createSubcontractorDto) {
        return this.subcontractorsService.create(createSubcontractorDto);
    }
    findAll() {
        return this.subcontractorsService.findAll();
    }
    findOne(id) {
        return this.subcontractorsService.findOne(+id);
    }
    update(id, updateSubcontractorDto) {
        return this.subcontractorsService.update(+id, updateSubcontractorDto);
    }
    remove(id) {
        return this.subcontractorsService.remove(+id);
    }
};
exports.SubcontractorsController = SubcontractorsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subcontractor_dto_1.CreateSubcontractorDto]),
    __metadata("design:returntype", void 0)
], SubcontractorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubcontractorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubcontractorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subcontractor_dto_1.UpdateSubcontractorDto]),
    __metadata("design:returntype", void 0)
], SubcontractorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubcontractorsController.prototype, "remove", null);
exports.SubcontractorsController = SubcontractorsController = __decorate([
    (0, common_1.Controller)('subcontractors'),
    __metadata("design:paramtypes", [subcontractors_service_1.SubcontractorsService])
], SubcontractorsController);
//# sourceMappingURL=subcontractors.controller.js.map