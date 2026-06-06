import { AuditlogsService } from './auditlogs.service';
export declare class AuditlogsController {
    private readonly auditlogsService;
    constructor(auditlogsService: AuditlogsService);
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
