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
exports.InventoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoriesService = class InventoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createInventoryDto) {
        return this.prisma.inventory.create({
            data: createInventoryDto,
        });
    }
    findAll() {
        return this.prisma.inventory.findMany({
            include: {
                project: true,
                material: true,
            }
        });
    }
    findAllMovements() {
        return this.prisma.inventoryMovement.findMany({
            include: {
                project: true,
                material: true,
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    findOne(id) {
        return this.prisma.inventory.findUnique({
            where: { id },
            include: {
                project: true,
                material: true,
            }
        });
    }
    update(id, updateInventoryDto) {
        return this.prisma.inventory.update({
            where: { id },
            data: updateInventoryDto,
        });
    }
    remove(id) {
        return this.prisma.inventory.delete({
            where: { id },
        });
    }
};
exports.InventoriesService = InventoriesService;
exports.InventoriesService = InventoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoriesService);
//# sourceMappingURL=inventories.service.js.map