import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}
  async create(createMessageDto: CreateMessageDto) {
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

  async findForUser(userId: number, role: string) {
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
      // Nếu là tin nhắn cá nhân, dùng isRead, nếu là tin nhắn nhóm, phải dựa vào readBy
      const isDirectMessage = msg.receiverId !== null;
      return {
        ...msg,
        isRead: isDirectMessage ? msg.isRead : msg.readBy.includes(`,${userId},`)
      };
    });
  }

  async markAsRead(id: number, userId: number) {
    const msg = await this.prisma.internalMessage.findUnique({ where: { id } });
    if (!msg) return;

    const newReadBy = msg.readBy.includes(`,${userId},`) ? msg.readBy : `${msg.readBy}${userId},`;
    
    return this.prisma.internalMessage.update({
      where: { id },
      data: { 
        isRead: msg.receiverId !== null ? true : false, 
        readBy: newReadBy 
      }
    });
  }

  async remove(id: number, userId: number) {
    const msg = await this.prisma.internalMessage.findUnique({ where: { id } });
    if (!msg) return;

    if (msg.receiverRole === 'ALL' || msg.receiverRole) {
      // Group message -> soft delete for this user
      const newDeletedBy = msg.deletedBy.includes(`,${userId},`) ? msg.deletedBy : `${msg.deletedBy}${userId},`;
      return this.prisma.internalMessage.update({
        where: { id },
        data: { deletedBy: newDeletedBy }
      });
    } else {
      // Direct message -> hard delete
      return this.prisma.internalMessage.delete({ where: { id } });
    }
  }
}
