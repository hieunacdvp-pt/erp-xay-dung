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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMessageDto) {
        return this.prisma.internalMessage.create({
            data: {
                senderId: createMessageDto.senderId,
                receiverId: createMessageDto.receiverId,
                receiverRole: createMessageDto.receiverRole,
                title: createMessageDto.title,
                content: createMessageDto.content,
                attachmentUrl: createMessageDto.attachmentUrl,
                type: createMessageDto.type || 'MESSAGE',
            },
        });
    }
    async findForUser(userId, role) {
        const messages = await this.prisma.internalMessage.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { receiverRole: role },
                    { receiverRole: 'ALL' }
                ],
                NOT: {
                    deletedBy: {
                        contains: `,${userId},`
                    }
                }
            },
            include: {
                sender: {
                    select: { id: true, username: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return messages.map(msg => {
            const isDirectMessage = msg.receiverId !== null;
            return {
                ...msg,
                isRead: isDirectMessage ? msg.isRead : msg.readBy.includes(`,${userId},`)
            };
        });
    }
    async markAsRead(id, userId) {
        const msg = await this.prisma.internalMessage.findUnique({ where: { id } });
        if (!msg)
            return;
        const newReadBy = msg.readBy.includes(`,${userId},`) ? msg.readBy : `${msg.readBy}${userId},`;
        return this.prisma.internalMessage.update({
            where: { id },
            data: {
                isRead: msg.receiverId !== null ? true : false,
                readBy: newReadBy
            }
        });
    }
    async remove(id, userId) {
        const msg = await this.prisma.internalMessage.findUnique({ where: { id } });
        if (!msg)
            return;
        if (msg.receiverRole === 'ALL' || msg.receiverRole) {
            const newDeletedBy = msg.deletedBy.includes(`,${userId},`) ? msg.deletedBy : `${msg.deletedBy}${userId},`;
            return this.prisma.internalMessage.update({
                where: { id },
                data: { deletedBy: newDeletedBy }
            });
        }
        else {
            return this.prisma.internalMessage.delete({ where: { id } });
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map