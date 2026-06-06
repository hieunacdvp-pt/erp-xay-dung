import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LicenseService],
  controllers: [LicenseController],
  exports: [LicenseService]
})
export class LicenseModule {}
