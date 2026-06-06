import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMessageDto: CreateMessageDto): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        receiverRole: string | null;
        title: string;
        content: string;
        attachmentUrl: string | null;
        isRead: boolean;
        readBy: string;
        deletedBy: string;
        senderId: number;
        receiverId: number | null;
    }>;
    findForUser(userId: number, role: string): Promise<{
        isRead: boolean;
        sender: {
            id: number;
            username: string;
            role: string;
        };
        id: number;
        createdAt: Date;
        type: string;
        receiverRole: string | null;
        title: string;
        content: string;
        attachmentUrl: string | null;
        readBy: string;
        deletedBy: string;
        senderId: number;
        receiverId: number | null;
    }[]>;
    markAsRead(id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        receiverRole: string | null;
        title: string;
        content: string;
        attachmentUrl: string | null;
        isRead: boolean;
        readBy: string;
        deletedBy: string;
        senderId: number;
        receiverId: number | null;
    } | undefined>;
    remove(id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        type: string;
        receiverRole: string | null;
        title: string;
        content: string;
        attachmentUrl: string | null;
        isRead: boolean;
        readBy: string;
        deletedBy: string;
        senderId: number;
        receiverId: number | null;
    } | undefined>;
}
