import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InventoriesModule } from './inventories/inventories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { PersonnelModule } from './personnel/personnel.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { MaterialsModule } from './materials/materials.module';
import { CustomersModule } from './customers/customers.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { ProjectsModule } from './projects/projects.module';
import { AssetsModule } from './assets/assets.module';
import { AttendancesModule } from './attendances/attendances.module';
import { SalesModule } from './sales/sales.module';
import { ReportsModule } from './reports/reports.module';
import { AccountingModule } from './accounting/accounting.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { ContractsModule } from './contracts/contracts.module';
import { AuditlogsModule } from './auditlogs/auditlogs.module';
import { RequisitionsModule } from './requisitions/requisitions.module';
import { ProgressReportsModule } from './progress-reports/progress-reports.module';
import { MessagesModule } from './messages/messages.module';
import { SubcontractorsModule } from './subcontractors/subcontractors.module';
import { SubcontractsModule } from './subcontracts/subcontracts.module';
import { ProcurementModule } from './procurement/procurement.module';
import { EquipmentModule } from './equipment/equipment.module';
import { LicenseModule } from './license/license.module';
import { LicenseGuard } from './license/license.guard';

@Module({
  imports: [
    PrismaModule, 
    ProjectsModule,
    InventoriesModule, 
    TransactionsModule, 
    AuthModule, 
    PersonnelModule,
    EnterpriseModule,
    MaterialsModule,
    CustomersModule,
    BankAccountsModule,
    AssetsModule,
    AttendancesModule,
    SalesModule,
    ReportsModule,
    AccountingModule,
    SystemSettingsModule,
    ContractsModule,
    AuditlogsModule,
    RequisitionsModule,
    ProgressReportsModule,
    MessagesModule,
    SubcontractorsModule,
    SubcontractsModule,
    ProcurementModule,
    EquipmentModule,
    LicenseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    }
  ],
})
export class AppModule {}
