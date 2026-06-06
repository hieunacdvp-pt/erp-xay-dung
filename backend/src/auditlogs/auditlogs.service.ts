import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditlogsService {
  constructor(private prisma: PrismaService) {}

  async log(action: string, entity: string, entityId: number, details?: any, userId?: number, username?: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          details: details ? JSON.stringify(details) : null,
          userId,
          username: username || 'SYSTEM'
        }
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200 // Limit to last 200 logs for performance
    });
  }
}
