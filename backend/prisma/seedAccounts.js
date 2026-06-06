const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const accounts = [
  { code: '111', name: 'Tiền mặt', type: 'ASSET' },
  { code: '112', name: 'Tiền gửi ngân hàng', type: 'ASSET' },
  { code: '131', name: 'Phải thu của khách hàng', type: 'ASSET' },
  { code: '1331', name: 'Thuế GTGT được khấu trừ', type: 'ASSET' },
  { code: '141', name: 'Tạm ứng', type: 'ASSET' },
  { code: '152', name: 'Nguyên liệu, vật liệu', type: 'ASSET' },
  { code: '154', name: 'Chi phí sản xuất, kinh doanh dở dang', type: 'ASSET' },
  { code: '156', name: 'Hàng hóa', type: 'ASSET' },
  { code: '211', name: 'Tài sản cố định hữu hình', type: 'ASSET' },
  { code: '214', name: 'Hao mòn tài sản cố định', type: 'ASSET' }, // Contra-asset
  { code: '242', name: 'Chi phí trả trước', type: 'ASSET' },
  
  { code: '331', name: 'Phải trả người bán', type: 'LIABILITY' },
  { code: '3331', name: 'Thuế GTGT phải nộp', type: 'LIABILITY' },
  { code: '334', name: 'Phải trả người lao động', type: 'LIABILITY' },
  { code: '338', name: 'Phải trả, phải nộp khác', type: 'LIABILITY' },
  { code: '341', name: 'Vay và nợ thuê tài chính', type: 'LIABILITY' },

  { code: '411', name: 'Vốn đầu tư của chủ sở hữu', type: 'EQUITY' },
  { code: '421', name: 'Lợi nhuận sau thuế chưa phân phối', type: 'EQUITY' },

  { code: '511', name: 'Doanh thu bán hàng và cung cấp dịch vụ', type: 'REVENUE' },
  { code: '515', name: 'Doanh thu hoạt động tài chính', type: 'REVENUE' },
  { code: '711', name: 'Thu nhập khác', type: 'REVENUE' },

  { code: '632', name: 'Giá vốn hàng bán', type: 'EXPENSE' },
  { code: '642', name: 'Chi phí quản lý doanh nghiệp', type: 'EXPENSE' },
  { code: '811', name: 'Chi phí khác', type: 'EXPENSE' },
  { code: '821', name: 'Chi phí thuế TNDN', type: 'EXPENSE' },
  { code: '911', name: 'Xác định kết quả kinh doanh', type: 'EQUITY' }
];

async function main() {
  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type },
      create: { code: acc.code, name: acc.name, type: acc.type }
    });
  }
  console.log('Seeded Accounts from Circular 133 successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
