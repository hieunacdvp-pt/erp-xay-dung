import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
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
    findForUser(userId: string, role: string): Promise<{
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
    markAsRead(id: string, userId: string): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
