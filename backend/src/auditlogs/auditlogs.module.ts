import { Module, Global } from '@nestjs/common';
import { AuditlogsService } from './auditlogs.service';
import { AuditlogsController } from './auditlogs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuditlogsController],
  providers: [AuditlogsService],
  exports: [AuditlogsService]
})
export class AuditlogsModule {}
