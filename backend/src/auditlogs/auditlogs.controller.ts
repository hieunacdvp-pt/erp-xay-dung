import { Controller, Get } from '@nestjs/common';
import { AuditlogsService } from './auditlogs.service';

@Controller('auditlogs')
export class AuditlogsController {
  constructor(private readonly auditlogsService: AuditlogsService) {}

  @Get()
  findAll() {
    return this.auditlogsService.findAll();
  }
}
