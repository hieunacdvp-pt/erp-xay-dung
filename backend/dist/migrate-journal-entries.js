"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const entries = await prisma.journalEntry.findMany({
        include: {
            transaction: true,
            movement: true,
            salesInvoice: true,
            assetAllocation: true,
            equipmentUsage: true,
        }
    });
    let updated = 0;
    for (const entry of entries) {
        let projectId = null;
        if (entry.transaction && entry.transaction.projectId)
            projectId = entry.transaction.projectId;
        else if (entry.movement && entry.movement.projectId)
            projectId = entry.movement.projectId;
        else if (entry.salesInvoice && entry.salesInvoice.projectId)
            projectId = entry.salesInvoice.projectId;
        else if (entry.assetAllocation && entry.assetAllocation.projectId)
            projectId = entry.assetAllocation.projectId;
        else if (entry.equipmentUsage && entry.equipmentUsage.projectId)
            projectId = entry.equipmentUsage.projectId;
        if (projectId) {
            await prisma.journalEntry.update({
                where: { id: entry.id },
                data: { projectId }
            });
            updated++;
        }
    }
    console.log(`Migrated ${updated} entries.`);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=migrate-journal-entries.js.map