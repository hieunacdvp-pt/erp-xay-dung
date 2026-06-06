import { Module } from '@nestjs/common';
import { SubcontractorsService } from './subcontractors.service';
import { SubcontractorsController } from './subcontractors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubcontractorsController],
  providers: [SubcontractorsService, PrismaService],
})
export class SubcontractorsModule {}
