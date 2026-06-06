import { Module } from '@nestjs/common';
import { SubcontractsService } from './subcontracts.service';
import { SubcontractsController } from './subcontracts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubcontractsController],
  providers: [SubcontractsService, PrismaService]
})
export class SubcontractsModule {}
