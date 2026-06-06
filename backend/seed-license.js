const jwt = require('jsonwebtoken');
const LICENSE_SECRET = 'CONST_ERP_MASTER_SECRET_KEY_2026_DO_NOT_SHARE';
const payload = {
  clientName: 'Công ty Test',
  domain: 'localhost',
  type: 'TRIAL',
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};
console.log(jwt.sign(payload, LICENSE_SECRET));
