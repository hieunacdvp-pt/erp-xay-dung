require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe('UPDATE JournalEntry SET projectId = 1 WHERE projectId IS NULL AND (description LIKE "% Landmark 82%" OR description LIKE "%Phiếu YC%")');
  console.log('Updated DB!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
