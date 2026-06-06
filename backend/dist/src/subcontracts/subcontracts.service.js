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
exports.SubcontractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubcontractsService = class SubcontractsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.subcontract.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null
            }
        });
    }
    findAll() {
        return this.prisma.subcontract.findMany({
            include: {
                subcontractor: true,
                project: true,
                acceptances: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    findOne(id) {
        return this.prisma.subcontract.findUnique({
            where: { id },
            include: {
                subcontractor: true,
                project: true,
                acceptances: true
            }
        });
    }
    update(id, data) {
        return this.prisma.subcontract.update({
            where: { id },
            data: {
                ...data,
                ...(data.startDate && { startDate: new Date(data.startDate) }),
                ...(data.endDate && { endDate: new Date(data.endDate) })
            }
        });
    }
    async createAcceptance(subcontractId, data) {
        const acceptance = await this.prisma.subcontractAcceptance.create({
            data: {
                subcontractId,
                date: new Date(data.date),
                acceptedValue: data.acceptedValue,
                note: data.note
            }
        });
        const subcontract = await this.prisma.subcontract.findUnique({
            where: { id: subcontractId }
        });
        if (subcontract) {
            await this.prisma.journalEntry.create({
                data: {
                    description: `Nghiệm thu HĐ thầu phụ: ${subcontract.name}`,
                    date: new Date(data.date),
                    projectId: subcontract.projectId,
                    lines: {
                        create: [
                            { accountCode: '154', debit: data.acceptedValue, credit: 0 },
                            { accountCode: '331', credit: data.acceptedValue, debit: 0 }
                        ]
                    }
                }
            });
        }
        return acceptance;
    }
};
exports.SubcontractsService = SubcontractsService;
exports.SubcontractsService = SubcontractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubcontractsService);
//# sourceMappingURL=subcontracts.service.js.map