import { PrismaService } from '../prisma/prisma.service';
export declare class AuditlogsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(action: string, entity: string, entityId: number, details?: any, userId?: number, username?: string): Promise<void>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        username: string | null;
        userId: number | null;
        action: string;
        entity: string;
        entityId: number | null;
        details: string | null;
    }[]>;
}
