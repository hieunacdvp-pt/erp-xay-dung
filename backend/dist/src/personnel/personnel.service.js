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
exports.PersonnelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PersonnelService = class PersonnelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createPersonnelDto) {
        return this.prisma.personnel.create({
            data: {
                ...createPersonnelDto,
                salaryPerDay: createPersonnelDto.salaryPerDay || 0,
            },
        });
    }
    findAll() {
        return this.prisma.personnel.findMany();
    }
    findOne(id) {
        return this.prisma.personnel.findUnique({
            where: { id },
        });
    }
    findByPhone(phone) {
        return this.prisma.personnel.findFirst({
            where: { phone },
        });
    }
    update(id, updatePersonnelDto) {
        return this.prisma.personnel.update({
            where: { id },
            data: updatePersonnelDto,
        });
    }
    remove(id) {
        return this.prisma.personnel.delete({
            where: { id },
        });
    }
};
exports.PersonnelService = PersonnelService;
exports.PersonnelService = PersonnelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonnelService);
//# sourceMappingURL=personnel.service.js.map