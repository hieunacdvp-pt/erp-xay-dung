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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const auditlogs_service_1 = require("../auditlogs/auditlogs.service");
let ContractsService = class ContractsService {
    prisma;
    auditLogger;
    constructor(prisma, auditLogger) {
        this.prisma = prisma;
        this.auditLogger = auditLogger;
    }
    async create(createContractDto) {
        const { milestones, ...contractData } = createContractDto;
        const contract = await this.prisma.contract.create({
            data: {
                ...contractData,
                milestones: milestones ? {
                    create: milestones
                } : undefined
            },
            include: {
                milestones: true,
                project: true,
                customer: true,
                guaranteeLetters: true
            }
        });
        await this.auditLogger.log('CREATE', 'Contract', contract.id, contract);
        return contract;
    }
    findAll() {
        return this.prisma.contract.findMany({
            include: {
                project: true,
                customer: true,
                milestones: true,
                guaranteeLetters: true
            }
        });
    }
    async findOne(id) {
        const contract = await this.prisma.contract.findUnique({
            where: { id },
            include: {
                project: true,
                customer: true,
                milestones: true,
                guaranteeLetters: true
            }
        });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        return contract;
    }
    async update(id, updateContractDto) {
        const { milestones, ...contractData } = updateContractDto;
        const updateOperations = [];
        if (milestones) {
            await this.prisma.contractMilestone.deleteMany({
                where: { contractId: id }
            });
            const updated = await this.prisma.contract.update({
                where: { id },
                data: {
                    ...contractData,
                    milestones: {
                        create: milestones
                    }
                },
                include: {
                    project: true,
                    customer: true,
                    milestones: true,
                    guaranteeLetters: true
                }
            });
            await this.auditLogger.log('UPDATE', 'Contract', id, updated);
            return updated;
        }
        const updated = await this.prisma.contract.update({
            where: { id },
            data: contractData,
            include: {
                project: true,
                customer: true,
                milestones: true,
                guaranteeLetters: true
            }
        });
        await this.auditLogger.log('UPDATE', 'Contract', id, updated);
        return updated;
    }
    async remove(id) {
        await this.prisma.$transaction([
            this.prisma.contractMilestone.deleteMany({ where: { contractId: id } }),
            this.prisma.guaranteeLetter.deleteMany({ where: { contractId: id } }),
            this.prisma.contract.delete({ where: { id } })
        ]);
        await this.auditLogger.log('DELETE', 'Contract', id, { deleted: true });
        return { success: true };
    }
    async updateMilestoneStatus(milestoneId, body) {
        const { status, accountId } = body;
        const milestone = await this.prisma.contractMilestone.findUnique({ where: { id: milestoneId }, include: { contract: true } });
        if (!milestone)
            throw new common_1.NotFoundException('Milestone not found');
        const updated = await this.prisma.contractMilestone.update({
            where: { id: milestoneId },
            data: { status }
        });
        if (status === 'INVOICED') {
            await this.prisma.journalEntry.create({
                data: {
                    description: `Nghiệm thu hợp đồng: ${milestone.name}`,
                    projectId: milestone.contract.projectId,
                    lines: {
                        create: [
                            { accountCode: '131', debit: milestone.amount, credit: 0 },
                            { accountCode: '511', debit: 0, credit: milestone.amount }
                        ]
                    }
                }
            });
        }
        else if (status === 'PAID') {
            const trn = await this.prisma.transaction.create({
                data: {
                    type: 'INCOME',
                    amount: milestone.amount,
                    category: 'OTHER',
                    description: `Thu tiền CĐT: ${milestone.name}`,
                    accountId: accountId || 1,
                    date: new Date()
                }
            });
            await this.prisma.journalEntry.create({
                data: {
                    description: `Thu tiền CĐT: ${milestone.name}`,
                    transactionId: trn.id,
                    projectId: milestone.contract.projectId,
                    lines: {
                        create: [
                            { accountCode: '112', debit: milestone.amount, credit: 0 },
                            { accountCode: '131', debit: 0, credit: milestone.amount }
                        ]
                    }
                }
            });
        }
        return updated;
    }
    async addGuaranteeLetter(contractId, data) {
        return this.prisma.guaranteeLetter.create({
            data: {
                contractId,
                ...data,
                issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date()
            }
        });
    }
    async updateGuaranteeLetter(id, data) {
        return this.prisma.guaranteeLetter.update({
            where: { id },
            data: {
                ...data,
                issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
            }
        });
    }
    async removeGuaranteeLetter(id) {
        return this.prisma.guaranteeLetter.delete({ where: { id } });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auditlogs_service_1.AuditlogsService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map